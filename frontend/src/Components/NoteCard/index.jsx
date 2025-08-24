import React, { useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InvertColorsOffIcon from "@mui/icons-material/InvertColorsOff";

function NoteCard({
  eachNote,
  handleEdit,
  handleDelete,
  handleArchieveDelete,
  handleMoreFeatures,
  moreFeatures,
  toggledPinAndArchieve,
  archieveIcon,

  showArchieve,
  isPinned,

  setShowColorPicker,
  // setNoteColor
  showColorPicker,
  setCardColor,
  cardColor,
}) {
  console.log(cardColor);

  const colors = [
    "#FFF9C4",
    "#E3F2FD",
    "#C8E6C9",
    "#F8BBD0",
    "#F5F5F5",
    "#E1BEE7",
    "#FFE0B2",
    "#B3E5FC",
    "#ECEFF1",
    "#FFFDE7",
  ]; // red, green, blue, yellow, purple

  const handleColorChange = (noteId, color) => {
    setCardColor((prev) => ({ ...prev, [noteId]: color }));
    setShowColorPicker((prev) => ({ ...prev, [noteId]: false }));
  };
  useEffect(() => {
    localStorage.setItem("color", JSON.stringify(cardColor));
  }, [cardColor]);

  const handleColorReversal = (ID) => {
    setCardColor((prev) => ({ ...prev, [ID]: null }));
    setShowColorPicker((prev) => ({ ...prev, [ID]: false }));
  };

  return (
    <div className="relative">
      <div
        key={eachNote.ID}
        className="border-1 w-[180px] h-36 md:w-[240px] md:h-40 rounded-[25px] m-2 shadow-2lg relative  "
        style={{ backgroundColor: cardColor[eachNote.ID] }}
      >
        <div className="flex justify-between items-center w-full pr-2">
          <p className="text-[10px] text-left pl-5 mt-1">{eachNote.date}</p>
          <div>
            <Tooltip title="Edit">
              <EditNoteIcon
                titleAccess="edit note"
                sx={{ fontSize: "15px", cursor: "pointer" }}
                onClick={() => {
                  handleEdit(eachNote);
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <RestoreFromTrashIcon
                sx={{
                  fontSize: "15px",
                  cursor: "pointer",
                  margin: "4px",
                }}
                onClick={() =>
                  showArchieve
                    ? handleArchieveDelete(eachNote.ID)
                    : handleDelete(eachNote.ID)
                }
              />
            </Tooltip>
            <Tooltip title="Priority">
              <button
                type="button"
                className={`border-1 h-[10px] w-[10px] rounded-[50%] ${
                  eachNote.priority === "Important"
                    ? "bg-green-400"
                    : "bg-red-500"
                }`}
              ></button>
            </Tooltip>
            <Tooltip
              title="More"
              onClick={() => handleMoreFeatures(eachNote.ID)}
            >
              <MoreVertIcon sx={{ fontSize: "15px", cursor: "pointer" }} />
            </Tooltip>
          </div>

          {moreFeatures[eachNote.ID] && (
            <div
              className="absolute right-3 top-6 shadow-xl border-1 p-1 mt-1 h-auto bg-white rounded-[6px]"
              style={{ backgroundColor: cardColor[eachNote.ID] }}
            >
              <span
                className="block p-1 text-[12px] font-semibold text-mano cursor-pointer hover:text-blue-600"
                onClick={() => {
                  toggledPinAndArchieve(eachNote.ID, "archieve");
                  handleMoreFeatures(eachNote.ID);
                }}
              >
                {archieveIcon ? "Archieve" : "Unarchieve"}
              </span>
              <span
                className="block p-1 text-[12px] font-semibold text-mano cursor-pointer hover:text-blue-600"
                onClick={() => {
                  toggledPinAndArchieve(eachNote.ID, "pinned");
                  handleMoreFeatures(eachNote.ID);
                }}
              >
                {isPinned ? "UnPin" : "Pin"}
              </span>
              <span
                className="block p-1 text-[12px] font-semibold text-mano cursor-pointer hover:text-blue-600"
                onClick={() => {
                  setShowColorPicker((prev) => ({
                    ...prev,
                    [eachNote.ID]: !prev[eachNote.ID],
                  }));
                  handleMoreFeatures(eachNote.ID);
                }}
              >
                Note Colour
              </span>
            </div>
          )}
        </div>

        <h2 className="font-mono text-xl text-left pl-4 font-semibold max-w-full">
          {eachNote.heading}
        </h2>
        <p className="overflow-auto mb-1 h-[50%] [&::-webkit-scrollbar]:hidden scroll-smooth font-mono text-xs text-left pl-4 mt-1 text-grey-400">
          {eachNote.text}
        </p>
        <p className="font-mono text-right text-[6px] md:text-[8px] absolute top-33 md:top-35 right-0 pr-4">
          Last edited : {new Date(eachNote.last_edited).toLocaleString()}
        </p>
      </div>
      {showColorPicker[eachNote.ID] && (
        <div className=" flex  gap-2  justify-center items-center z-50 h-[100px] w-[200px] flex-wrap absolute top-10 left-6 shadow-2xl rounded-[10px] bg-white  border-1">
          <InvertColorsOffIcon
            className="mt-2"
            onClick={() => {
              handleColorReversal(eachNote.ID);
            }}
          />
          {colors.map((color) => {
            return (
              <div
                key={color}
                className=" mt-2 h-6  w-6 cursor-pointer  rounded-[50%] "
                style={{ backgroundColor: color }}
                title={color}
                onClick={() => handleColorChange(eachNote.ID, color)}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NoteCard;
