from fabric.api import *

env.repos = {
    'origin': ['master', 'master:gh-pages'],
    'newsci': ['master', 'master:gh-pages']
}

env.grids = {
    'annual': 'data/annual.csv',
    'fiveyear': 'data/5year.csv'
}

def shard():
    for data_type, filename in env.grids.items():
        local('python bin/shard.py %s %s' % (filename, data_type))


def deploy():
    for remote, branches in env.repos.items():
        for branch in branches:
            local('git push %s %s' % (remote, branch))
