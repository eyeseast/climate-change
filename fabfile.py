import csv
import json
import textwrap

from fabric.api import *

env.repos = {
    'origin': ['master', 'master:gh-pages'],
    'newsci': ['master', 'master:gh-pages']
}

env.grids = {
    'annual': 'data/annual.csv',
    'fiveyear': 'data/5year.csv'
}


def safe_float(n, nulls=['9999', 'null', '']):
    if n in nulls:
        return None
    try:
        return float(n)
    except ValueError:
        return None


def shard():
    for data_type, filename in env.grids.items():
        local('python bin/shard.py %s %s' % (filename, data_type))


def deploy():
    for remote, branches in env.repos.items():
        for branch in branches:
            local('git push %s %s' % (remote, branch))


def global_data(filename='data/global.csv'):
    """
    Write global temp data to js/chart-data.js 
    """
    TEMPLATE = textwrap.dedent("""\
    var GLOBAL_FIVE_YEAR = %(fiveyear)s
      , GLOBAL_ONE_YEAR = %(annual)s;
    """)

    with open(filename) as f:
        reader = csv.DictReader(f)
        data = list(reader)

        annual = [safe_float(row['Annual_Mean']) for row in data]
        fiveyear = [safe_float(row['5-year_Mean']) for row in data]

        with open('js/chart-data.js', 'wb') as out:
            out.write(TEMPLATE % {'annual': json.dumps(annual), 'fiveyear': json.dumps(fiveyear)})

    local('jammit')