#!/usr/bin/env python3

import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

class Extractor:
    def __init__(self, dir='.', lang='en'):
        self.dir = Path(dir)
        self.lang = lang

    def extract(self):
        return [self.extract_from_path(path) for path in self.extraction_paths()]

    def extraction_paths(self):
        return self.dir.glob('**/Issues/*/description.xml')

    def extract_from_path(self, path: str) -> dict:
        doc = ET.parse(path)
        attr_attribute = doc.find('Attributes')

        if attr_attribute:
            attrs = attr_attribute.findall('Attribute')
        else:
            attrs = []

        scheme_el = doc.find('SchemeManager')
        issuer_el = doc.find('IssuerID')
        credential_el = doc.find('CredentialID')

        scheme = "" if scheme_el is None else scheme_el.text
        issuer = "" if issuer_el is None else issuer_el.text
        credential =  "" if credential_el is None else credential_el.text

        attributes = {
            "id": f"{scheme}.{issuer}.{credential}",
            "name": self.extract_text(doc, 'Name'),
            "description": self.extract_text(doc, 'Description'),
            "url": self.extract_text(doc, 'IssueURL'),
            "attributes": [{
                **attr.attrib,
                "name": self.extract_text(attr, 'Name'),
                "description": self.extract_text(attr, 'Description'),
            } for attr in attrs]
        }
        return attributes

    def extract_text(self, el, attr):
        el = el.find(attr)
        if el is None:
            return None

        el = el.find(self.lang)
        if el is None:
            return None

        return el.text


if __name__ == '__main__':
    kwargs = {}

    if len(sys.argv) > 1:
        kwargs['dir'] = sys.argv[1]
    if len(sys.argv) > 2:
        kwargs['lang'] = sys.argv[2]

    print(json.dumps(Extractor(**kwargs).extract(), indent=2))
