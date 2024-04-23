# nb-crdt

[![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/notebox)

A block based Conflict-free Replicated Data Type that enables collaborative editing across multiple participants allowing for flexible data sharing across spreadsheets, boards, rich text, and more.

## Development

### Prerequisites
```
npm install
```

### Test
```
npm test
```

## Checkout Points
for synchronization, just investigate
  - `domain/entity/block`
  - `domain/entity/contribution`

for making an editor, all the interfaces you need are in
  - `domain/usecase/replica`

## Key Concepts
- `replicaID`
    - is an identifier for writers or devices
- `note`
    - consists of `blocks`
    - `block`
        - `block-props`
            - nested json object for block properties
            - each leaf has its own stamp
                - `replicaID`
                - `timestamp`
        - `text`
            - consists of `spans`
            - `span`
                - `point`
                    - position identifier
                - `content`
                    - `attrs`
                        - length
                        - `text-props`
                            - flat json object
                        - `stamp`
                    - string (UTF16)
        - `version`
            - per `replicaID`
                - `block-props` version
                - `text-points` or `DB_RECORD-point` version
