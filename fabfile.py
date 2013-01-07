from fabric.api import *

env.repos = {
    'origin': ['master', 'master:gh-pages'],
    'newsci': ['master', 'master:gh-pages']
}

def deploy():
    for remote, branches in env.repos.items():
        for branch in branches:
            local('git push %s %s' % (remote, branch))