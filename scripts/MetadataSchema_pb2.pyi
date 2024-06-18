from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class PointData(_message.Message):
    __slots__ = ("position", "color", "geneName", "cellId")
    POSITION_FIELD_NUMBER: _ClassVar[int]
    COLOR_FIELD_NUMBER: _ClassVar[int]
    GENENAME_FIELD_NUMBER: _ClassVar[int]
    CELLID_FIELD_NUMBER: _ClassVar[int]
    position: _containers.RepeatedScalarFieldContainer[float]
    color: _containers.RepeatedScalarFieldContainer[int]
    geneName: str
    cellId: str
    def __init__(self, position: _Optional[_Iterable[float]] = ..., color: _Optional[_Iterable[int]] = ..., geneName: _Optional[str] = ..., cellId: _Optional[str] = ...) -> None: ...

class TileData(_message.Message):
    __slots__ = ("pointsData", "numberOfPoints")
    POINTSDATA_FIELD_NUMBER: _ClassVar[int]
    NUMBEROFPOINTS_FIELD_NUMBER: _ClassVar[int]
    pointsData: _containers.RepeatedCompositeFieldContainer[PointData]
    numberOfPoints: int
    def __init__(self, pointsData: _Optional[_Iterable[_Union[PointData, _Mapping]]] = ..., numberOfPoints: _Optional[int] = ...) -> None: ...

class ColumnData(_message.Message):
    __slots__ = ("columnTiles",)
    COLUMNTILES_FIELD_NUMBER: _ClassVar[int]
    columnTiles: _containers.RepeatedCompositeFieldContainer[TileData]
    def __init__(self, columnTiles: _Optional[_Iterable[_Union[TileData, _Mapping]]] = ...) -> None: ...

class LevelData(_message.Message):
    __slots__ = ("levelColumns",)
    LEVELCOLUMNS_FIELD_NUMBER: _ClassVar[int]
    levelColumns: _containers.RepeatedCompositeFieldContainer[ColumnData]
    def __init__(self, levelColumns: _Optional[_Iterable[_Union[ColumnData, _Mapping]]] = ...) -> None: ...

class Metadata(_message.Message):
    __slots__ = ("level",)
    LEVEL_FIELD_NUMBER: _ClassVar[int]
    level: _containers.RepeatedCompositeFieldContainer[LevelData]
    def __init__(self, level: _Optional[_Iterable[_Union[LevelData, _Mapping]]] = ...) -> None: ...
