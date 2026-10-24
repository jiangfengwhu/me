"""Refresh public GitHub profile data and original badge images; no token needed."""
import json
import os
import re
import urllib.request
import urllib.error
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
USER = 'jiangfengwhu'


def get(url):
    headers = {'User-Agent': 'portfolio-profile-sync', 'Accept': '*/*'}
    if url.startswith('https://api.github.com/') and os.environ.get('GITHUB_TOKEN'):
        headers['Authorization'] = 'Bearer ' + os.environ['GITHUB_TOKEN']
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read()


class ProfileParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.badges = {}
        self.days = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img' and attrs.get('data-hovercard-type') == 'achievement':
            source = attrs.get('src', '')
            if not source.startswith('https://github.githubassets.com/assets/'):
                return
            slug = attrs['data-hovercard-url'].split('/achievements/')[1].split('/')[0]
            if re.fullmatch(r'[a-z0-9-]+', slug):
                self.badges[slug] = {'label': attrs.get('alt', '').removeprefix('Achievement: '),
                                     'src': f'/assets/github/{slug}.png', 'source': source}
        if tag == 'td' and 'data-date' in attrs and 'data-level' in attrs:
            day = date.fromisoformat(attrs['data-date'])
            self.days[day] = int(attrs['data-level'])


def sync():
    with ThreadPoolExecutor(max_workers=3) as executor:
        profile, calendar = list(executor.map(get, [
            f'https://github.com/{USER}', f'https://github.com/users/{USER}/contributions']))
    parser = ProfileParser()
    parser.feed(profile.decode())
    parser.feed(calendar.decode())
    if len(parser.days) < 360 or not parser.badges:
        raise ValueError('Incomplete GitHub response; preserving previous snapshot')
    previous = json.loads((ROOT / 'src/data/githubSnapshot.json').read_text(encoding='utf-8'))
    try:
        repos = json.loads(get(f'https://api.github.com/users/{USER}/repos?per_page=100&sort=full_name'))
    except urllib.error.HTTPError as error:
        if error.code not in (403, 429):
            raise
        print('GitHub API rate limited; retaining previous language statistics')
        repos = []
    if len(repos) == 100:
        page = 2
        while True:
            more = json.loads(get(f'https://api.github.com/users/{USER}/repos?per_page=100&page={page}&sort=full_name'))
            repos.extend(more)
            if len(more) < 100:
                break
            page += 1
    first, last = min(parser.days), max(parser.days)
    levels = ['0'] * (((last - first).days // 7 + 1) * 7)
    for day, level in parser.days.items():
        levels[(day - first).days] = str(level)
    counts = Counter(repo.get('language') or 'Other' for repo in repos)
    colors = {'TypeScript': '#3178c6', 'Go': '#00add8', 'JavaScript': '#f1e05a',
              'Python': '#3572a5', 'Dart': '#00b4ab', 'Swift': '#f05138',
              'Kotlin': '#a97bff', 'HTML': '#e34c26', 'CSS': '#563d7c'}
    top = counts.most_common(6)
    others = sum(counts.values()) - sum(count for _, count in top)
    languages = [{'name': name, 'count': count, 'color': colors.get(name, '#64748b')} for name, count in top]
    if others:
        languages.append({'name': 'Other', 'count': others, 'color': '#64748b'})
    if not repos:
        languages = previous['activity']['languages']
    total_match = re.search(r'([\d,]+)\s+contributions\s+in the last year', calendar.decode())
    data = {'updatedAt': datetime.now(timezone.utc).date().isoformat(), 'source': f'https://github.com/{USER}',
            'repositoryCount': len(repos) or previous['repositoryCount'], 'achievements': list(parser.badges.values()),
            'activity': {'total': int(total_match[1].replace(',', '')) if total_match else None,
                         'startDate': first.isoformat(), 'endDate': last.isoformat(),
                         'weeks': len(levels) // 7, 'levels': ''.join(levels), 'languages': languages}}
    assets = ROOT / 'public/assets/github'
    assets.mkdir(parents=True, exist_ok=True)
    # Complete all downloads before publishing the new snapshot.
    for slug, badge in parser.badges.items():
        payload = get(badge['source'])
        if not payload.startswith(b'\x89PNG'):
            raise ValueError('Unexpected badge format')
        (assets / f'{slug}.png').write_bytes(payload)
    (ROOT / 'src/data/githubSnapshot.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Updated {len(parser.days)} contribution days, badges: {", ".join(parser.badges)}; {data["repositoryCount"]} repos')


if __name__ == '__main__':
    sync()
