#!/usr/bin/env python
"""
A conversion script for turning GISTEMP data into usable GIS files. We want
an easy way to query for a list of temperatures over time by searching lat/lng.

We're starting with a data structure that looks roughly like this:

time:
  lat:
    - lng
    - lng
    - lng

The goal here is to end up with a data structure like this:

lat:
  lng:
    - time
    - time
    - time
  lng:
    - time
    - time
    - time

(It might make more sense to have longitude be top level, it's the horizontal axis.)

"""
import argparse
import csv
import json
import sys

import fiona
import random
from shapely.geometry import box, mapping

def get_temps(data, lat_id, lng_id):
    """
    Find temperature data from a two-dimensional matrix.
    Returns a list of temperature anomalies.
    """
    # keys are strings, so coerce
    lat_id = str(lat_id)
    lng_id = str(lng_id)

    # return a list
    return [float(d[lng_id]) for d in data if d['lat'] == lat_id]


def make_grid():
    """
    Build a grid of two-by-two latitudes and longitudes
    """
    grid = []
    longitudes = range(-180, 180, 2)
    latitudes = range(-90, 90, 2)

    for lng in longitudes:
        longitude = []
        grid.append(longitude)
        for lat in latitudes:
            b = box(lng, lat, lng + 2, lat + 2)
            longitude.append(b)

    return grid


def main(datafile='../data/tempanomaly.csv', outfile='./grid.json', format='GeoJSON'):
    """
    Write a shapefile with our grid
    """
    grid = make_grid()
    schema = {
        'geometry': 'Polygon', 
        'properties': {
            'lat_id': 'int',
            'lng_id': 'int',
            'temps': 'str',
            'latest': 'float'
        }
    }

    with open(datafile) as f:
        # read this file once, store a list
        # we'll iterate this list a bunch of times
        # so it's worth storing it in memory once
        data = list(csv.DictReader(f))

    with fiona.collection(outfile, 'w', format, schema) as c:
        for lng_id, lng in enumerate(grid, 1):
            for lat_id, lat in enumerate(lng, 1):
                temps = get_temps(data, lat_id, lng_id)
                c.write({
                    'properties': {
                        'lat_id': lat_id,
                        'lng_id': lng_id,
                        'temps': json.dumps(temps),
                        'latest': temps[-1]
                    },
                    'geometry'  : mapping(lat)
                })

parser = argparse.ArgumentParser(description="""\
A conversion script for turning GISTEMP data into usable GIS files.
""")

parser.add_argument('infile',
    help="Path to a CSV file containing tempanomaly grid data")
parser.add_argument('outfile',
    help="Destination for output file")

if __name__ == "__main__":
    args = parser.parse_args()
    main(args.infile, args.outfile)

