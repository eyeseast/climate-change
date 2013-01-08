#!/usr/bin/env python
"""
Store grid data in a sharded file tree. Any 2x2 grid square should be accessible at a URL like:

    data/{lat}/{lng}.json

Each file should contain all historical data for that lat/lng square, encoded as JSON.
"""

import argparse
import csv
import json
import sys
import os


BIN = os.path.realpath(os.path.dirname(__file__))
ROOT = os.path.dirname(BIN)
DATA = os.path.join(ROOT, 'data')


def enum(sequence, start=0, step=1):
    "Like built-in enumerate, but with steps"
    n = start
    for item in sequence:
        yield n, item
        n += step


def get_temps(data, lat_id, lng_id):
    """
    Find temperature data from a two-dimensional matrix.
    Returns a list of temperature anomalies.
    """
    # keys are strings, so coerce
    lat_id = str(lat_id)
    lng_id = str(lng_id)

    # return a list
    return [safe_float(d[lng_id]) for d in data if d['lat'] == lat_id]


def make_path(base, lat, lng):
    path = os.path.join(base, str(lat), '%i.json' % (lng))


def safe_float(n, nulls=['9999', 'null', '']):
    if n in nulls:
        return None
    try:
        return float(n)
    except ValueError:
        return None


def shard(file, data_type='annual', prefix='grid'):
    """
    Parse the file as CSV. Create directory structure.
    Save grid data.
    """
    # latitudes and longitudes are known
    latitudes = range(-89, 91, 2)
    longitudes = range(-179, 181, 2)

    # read data once
    reader = csv.DictReader(file)
    data = list(reader)

    base = os.path.join(DATA, prefix, data_type)

    for lng in longitudes:
        for lat in latitudes:
            # filter out temp data
            temps = get_temps(data, lat, lng)
            
            # ensure we have a place to put it
            # shift one degree in each direction
            # to get a grid edge
            dirname = os.path.join(base, str(lat - 1))
            if not os.path.exists(dirname):
                os.makedirs(dirname)

            # write the actual file
            path = os.path.join(dirname, '%i.json' % (lng - 1))
            with open(path, 'wb') as f:
                f.write(json.dumps(temps))
                print "File: %s - %i" % (path, len(temps))


usage = """
Usage:
    shard.py <filename> <data_type>
        """


if __name__ == '__main__':
    if len(sys.argv) > 2:
        filename = sys.argv[1]
        data_type = sys.argv[2]
        with open(filename) as f:
            shard(f, data_type)

    else:
        print usage

