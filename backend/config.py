"""
Central configuration — every module imports constants from here.
"""

import os

ROUND_ROBIN_QUANTUM = 5          # minutes per time-slice
AGING_THRESHOLD_MINUTES = 15     # wait time before priority bump
AGING_BOOST = 10                 # priority score added per threshold exceeded
NUM_DOCTORS = 1                  # default; overridable via API
SORT_LARGE_THRESHOLD = 10        # use MergeSort above this count
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
