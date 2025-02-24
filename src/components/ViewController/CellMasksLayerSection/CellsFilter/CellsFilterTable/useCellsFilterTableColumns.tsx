import { GetApplyQuickFilterFn, GridColDef } from "@mui/x-data-grid";
import LensIcon from "@mui/icons-material/Lens";
import { Tooltip, Typography } from "@mui/material";
import { CellsFilterTableRowEntry } from "./CellsFilterTable.types";

export const useCellsFilterTableColumns =
  (): GridColDef<CellsFilterTableRowEntry>[] => {
    const geneColorQuickFilter: GetApplyQuickFilterFn<any, unknown> = (
      value
    ) => {
      if (!(value as string).startsWith("[")) {
        return null;
      }

      const parsedValue = (value as string)
        .replace(/\[|\]/g, "")
        .split(" ")
        .map(Number);

      console.log(value, parsedValue);

      return (cellValue) =>
        parsedValue.every((value) =>
          (cellValue as Array<number>).includes(value)
        );
    };

    return [
      {
        field: "clusterId",
        headerName: "Cluster ID",
        headerAlign: "center",
        filterable: true,
        flex: 1,
        renderCell: (params) => <Typography>{params.row.clusterId}</Typography>,
      },
      {
        field: "color",
        headerAlign: "center",
        headerName: "Color",
        filterable: false,
        flex: 1,
        getApplyQuickFilterFn: geneColorQuickFilter,
        renderCell: (params) => (
          <Tooltip title={`RGB: ${params.row.color.join(" ")}`}>
            <LensIcon style={{ color: `rgb(${params.row.color})` }} />
          </Tooltip>
        ),
      },
    ];
  };
