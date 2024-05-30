export const getCustomTooltp = ({ object }: { object: any }) => {
  return (
    object && {
      html: `
      <div style="display: flex; gap: 10px;">
        <div style="font-weight: 300;">
          ${"position" in object ? "<p>Position</p>" : ""}
          <p>Color</p>
          <p>${('geneName' in object) ? 'Gene Name:' : 'Cell name: ' }</p>
          <p>Cell ID: </p>
        </div>
        <div style="font-weight: 500;">
          ${
            "position" in object
              ? `<p>X ${object.position[0].toFixed(
                  2
                )} Y ${object.position[1].toFixed(2)}</p>`
              : ""
          }
          <p>R ${object.color[0]} G ${object.color[1]} B ${object.color[2]}</p>
          <p>${('geneName' in object) ? object.geneName : object.cellName}</p>
          <p>${object.cellId}</p>
        </div>
      </div>
    `,
      style: {
        padding: "0px 15px 0px 10px",
        backgroundColor: "rgba(51, 51, 51)",
        borderColor: "#ababab",
        border: "2px solid",
        borderRadius: "10px",
        fontSize: "0.8em",
        color: "#FFF",
      },
    }
  );
};