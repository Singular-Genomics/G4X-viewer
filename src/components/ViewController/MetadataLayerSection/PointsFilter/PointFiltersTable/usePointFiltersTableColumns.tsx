import { GridColDef } from "@mui/x-data-grid";
import LensIcon from "@mui/icons-material/Lens";
import { Tooltip, Typography } from "@mui/material";
import { PointFiltersTableRowEntry } from "./PointFiltersTable.types";

export const usePointFiltersTableColumns =
  (): GridColDef<PointFiltersTableRowEntry>[] => {
    return [
      {
        field: "geneName",
        headerName: "Gene Name",
        headerAlign: "center",
        flex: 1,
        renderCell: (params) => <Typography>{params.row.gene_name}</Typography>,
      },
      {
        field: "geneColor",
        headerAlign: "center",
        headerName: "Color",
        flex: 1,
        renderCell: (params) => (
          <Tooltip title={`RGB: ${params.row.color.join(" ")}`}>
            <LensIcon style={{ color: `rgb(${params.row.color})` }} />
          </Tooltip>
        ),
      },
    ];
  };
