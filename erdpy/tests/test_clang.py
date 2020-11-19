import logging
import unittest
from pathlib import Path

from erdpy.tests import utils

logging.basicConfig(level=logging.ERROR)


class ProjectClangTestCase(utils.ProjectTestCase):
    def setUp(self):
        super().setUp()

    def test_clang_hello(self):
        _, contract = self.build("clang_hello")

    def test_clang_hello(self):
        _, contract = self.build("clang_hello")
