import { useDropzone } from "react-dropzone";
import {
  GeneralDetailsType,
  useViewerStore,
} from "../../../../stores/ViewerStore";
import { useSnackbar } from "notistack";

export const useGeneralDetailsHandler = () => {
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = async (files: File[]) => {
    if (files.length !== 1) {
      enqueueSnackbar({
        message: "Please upload a single details file",
        variant: "error",
      });
      return;
    }

    const file = files[0];
    if (!file.name.endsWith(".json")) {
      enqueueSnackbar({
        message: "Invalid file format. Only .json files are allowed",
        variant: "error",
      });
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const generalDetails: GeneralDetailsType = {
        fileName: file.name,
        data: jsonData,
      };

      useViewerStore.getState().setGeneralDetails(generalDetails);

      enqueueSnackbar({
        message: "General details file loaded successfully",
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar({
        message: "Error parsing JSON file: " + (error as Error).message,
        variant: "error",
      });
    }
  };

  const dropzoneProps = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    multiple: false,
  });

  return dropzoneProps;
};
