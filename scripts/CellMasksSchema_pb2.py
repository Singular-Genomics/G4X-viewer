# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: CellMasksSchema.proto
# Protobuf Python Version: 5.26.1
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x15\x43\x65llMasksSchema.proto\"\x8b\x01\n\nSingleMask\x12\x10\n\x08vertices\x18\x01 \x03(\x01\x12\x11\n\x05\x63olor\x18\x02 \x03(\rB\x02\x10\x01\x12\x0c\n\x04\x61rea\x18\x03 \x01(\t\x12\x13\n\x0btotalCounts\x18\x04 \x01(\t\x12\x12\n\ntotalGenes\x18\x05 \x01(\t\x12\x0e\n\x06\x63\x65llId\x18\x06 \x01(\t\x12\x11\n\tclusterId\x18\x07 \x01(\t\"5\n\rColormapEntry\x12\x11\n\tclusterId\x18\x01 \x01(\t\x12\x11\n\x05\x63olor\x18\x02 \x03(\rB\x02\x10\x01\"d\n\tCellMasks\x12\x1e\n\tcellMasks\x18\x01 \x03(\x0b\x32\x0b.SingleMask\x12 \n\x08\x63olormap\x18\x02 \x03(\x0b\x32\x0e.ColormapEntry\x12\x15\n\rnumberOfCells\x18\x03 \x01(\rb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'CellMasksSchema_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_SINGLEMASK'].fields_by_name['color']._loaded_options = None
  _globals['_SINGLEMASK'].fields_by_name['color']._serialized_options = b'\020\001'
  _globals['_COLORMAPENTRY'].fields_by_name['color']._loaded_options = None
  _globals['_COLORMAPENTRY'].fields_by_name['color']._serialized_options = b'\020\001'
  _globals['_SINGLEMASK']._serialized_start=26
  _globals['_SINGLEMASK']._serialized_end=165
  _globals['_COLORMAPENTRY']._serialized_start=167
  _globals['_COLORMAPENTRY']._serialized_end=220
  _globals['_CELLMASKS']._serialized_start=222
  _globals['_CELLMASKS']._serialized_end=322
# @@protoc_insertion_point(module_scope)
