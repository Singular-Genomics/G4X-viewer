from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class SingleMask(_message.Message):
    __slots__ = ("vertices", "color", "area", "totalCounts", "totalGenes", "cellId", "clusterId")
    VERTICES_FIELD_NUMBER: _ClassVar[int]
    COLOR_FIELD_NUMBER: _ClassVar[int]
    AREA_FIELD_NUMBER: _ClassVar[int]
    TOTALCOUNTS_FIELD_NUMBER: _ClassVar[int]
    TOTALGENES_FIELD_NUMBER: _ClassVar[int]
    CELLID_FIELD_NUMBER: _ClassVar[int]
    CLUSTERID_FIELD_NUMBER: _ClassVar[int]
    vertices: _containers.RepeatedScalarFieldContainer[float]
    color: _containers.RepeatedScalarFieldContainer[int]
    area: str
    totalCounts: str
    totalGenes: str
    cellId: str
    clusterId: str
    def __init__(self, vertices: _Optional[_Iterable[float]] = ..., color: _Optional[_Iterable[int]] = ..., area: _Optional[str] = ..., totalCounts: _Optional[str] = ..., totalGenes: _Optional[str] = ..., cellId: _Optional[str] = ..., clusterId: _Optional[str] = ...) -> None: ...

class ColormapEntry(_message.Message):
    __slots__ = ("cellName", "color")
    CELLNAME_FIELD_NUMBER: _ClassVar[int]
    COLOR_FIELD_NUMBER: _ClassVar[int]
    cellName: str
    color: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, cellName: _Optional[str] = ..., color: _Optional[_Iterable[int]] = ...) -> None: ...

class CellMasks(_message.Message):
    __slots__ = ("cellMasks", "colormap", "numberOfCells")
    CELLMASKS_FIELD_NUMBER: _ClassVar[int]
    COLORMAP_FIELD_NUMBER: _ClassVar[int]
    NUMBEROFCELLS_FIELD_NUMBER: _ClassVar[int]
    cellMasks: _containers.RepeatedCompositeFieldContainer[SingleMask]
    colormap: _containers.RepeatedCompositeFieldContainer[ColormapEntry]
    numberOfCells: int
    def __init__(self, cellMasks: _Optional[_Iterable[_Union[SingleMask, _Mapping]]] = ..., colormap: _Optional[_Iterable[_Union[ColormapEntry, _Mapping]]] = ..., numberOfCells: _Optional[int] = ...) -> None: ...
