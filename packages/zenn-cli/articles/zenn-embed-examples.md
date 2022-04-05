---
title: 'zenn-embeddedのテスト'
type: 'tech' # or "idea"
topics: ['embed', 'test']
emoji: 🐲
published: false
---

`<iframe />` を用いて要素を表示する機能の一覧

## Github

**短い行数**

https://github.com/zenn-dev/zenn-editor/blob/canary/lerna.json

**長い行数**

https://github.com/zenn-dev/zenn-editor/blob/canary/yarn.lock

**行数指定**

https://github.com/zenn-dev/zenn-editor/blob/canary/yarn.lock#L4-L14

**開始行のみ指定**

https://github.com/zenn-dev/zenn-editor/blob/canary/yarn.lock#L4

## Github Gist

@[gist](https://gist.github.com/octocat/6cad326836d38bd3a7ae)

## Link Card ( Default )

https://zenn.dev

## Link Card ( Github Repository )

https://github.com/zenn-dev/zenn-editor

## Link Card ( Github Repository 以外のページ )

https://github.com/zenn-dev/zenn-editor/issues

## Mermaid

```mermaid
classDiagram
class GeoPointType {
 <<enumeration>>
  BROWNFIELD
  OGWELL
  CELL_TOWER
  NUCLEAR_REACTOR
  SUPERFUND
}
class GeoPoint {
  -UUID id
  +GeoPointType type
  +GeographyPoint location
  -UUID metadata references metadata(id)
  +Datetime createdAt
}
class GeographyPoint {
  <<interface>>
  +GeoJSON geojson
  +Int srid
  +Float longitude
  +Float latitude
}
class NearbyPoint {
 <<Interface>>
  -UUID id references GeoPoint(id)
  +GeoPointType GeoPoint::type
  +GeographyPoint GeoPoint::location
  +UUID GeoPoint::metadata
  +Float distance
}
class NearbyPoints {
<<Service>>
  +GeoJSON origin
  +Float radiusMi
  +Int first
  +Int last
  +Int offset
  +Cursor before
  +Cursor after
}
class Hotel {
 -UUID id
+String name
-Int objectid
}
GeoPoint *-- GeoPointType: Composition
GeoPoint *-- GeographyPoint: Composition
GeoPoint "1" <|-- "1" NearbyPoint: Implements
NearbyPoints "1" -- "0..n"NearbyPoint: Contains
Hotel "1" -- "1" GeoPoint: May Contain
```

## Tweet Card

https://twitter.com/jack/status/20
