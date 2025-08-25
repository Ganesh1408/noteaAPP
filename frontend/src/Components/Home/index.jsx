import { useEffect, useState } from "react";
import ShareIcon from "@mui/icons-material/Share";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import GridViewIcon from "@mui/icons-material/GridView";
import HorizontalSplitIcon from "@mui/icons-material/HorizontalSplit";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import NoteCard from "../NoteCard";
import React from "react";

function Home() {
  const [searchInputValue, setSearchInputValue] = useState("");
  const [note, setNote] = useState([]);
  const [form, setForm] = useState({
    date: "",
    heading: "",
    text: "",
    priority: "",
    pinned: false,
    archieve: false,
  });

  const [visible, setVisible] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [successMesssage, setSuccessMessage] = useState(false);
  const [displayNote, setDisplayNote] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [sortVisible, setSortVisible] = useState(false);
  const [archieveIcon, setArchieveIcon] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activesort, setActiveSort] = useState(() => {
    const savedSort = localStorage.getItem("activeSort");

    if (!savedSort) return "";
    try {
      const parsedSort = JSON.parse(savedSort);
      return parsedSort;
    } catch (e) {
      console.log("Invalid json for activeSort in localstorage", e);
      return "";
    }
  });

  const [iconView, setIconView] = useState(() => {
    try {
      const savedView = localStorage.getItem("iconView");
      if (savedView === null) return true;
      const parsed = JSON.parse(savedView);
      // console.log(parsed)
      return typeof parsed === "boolean" ? parsed : true;
    } catch {
      return true;
    }
  });
  const [moreFeatures, setMoreFeatures] = useState({});

  useEffect(() => {
    localStorage.setItem("activeSort", JSON.stringify(activesort));
  }, [activesort]);

  useEffect(() => {
    localStorage.setItem("iconView", JSON.stringify(iconView));
  }, [iconView]);

  const toggleIconView = () => {
    setIconView((prev) => !prev);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [archieveNotes, setArchieveNotes] = useState([]);
  const [showArchieve, setShowArchieve] = useState(false);
  const [cardColor, setCardColor] = useState(() => {
    const savedColor = localStorage.getItem("color");
    return savedColor ? JSON.parse(savedColor) : {};
  });

  const [pinnedNote, setPinnedNote] = useState([]);

  //handle form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //handle search
  const handleSearch = async (e) => {
    const value = e.target.value;

    setSearchInputValue(value);
    if (value.trim() === "") {
      setDisplayNote(showArchieve ? archieveNotes : note);

      return;
    }

    //filter note from list
    console.log(showArchieve);
    const filteredNotes = (showArchieve ? archieveNotes : note).filter(
      (eachNote) =>
        eachNote.heading.toLowerCase().includes(value.toLowerCase()) ||
        eachNote.text.toLowerCase().includes(value.toLowerCase())
    );

    setDisplayNote(filteredNotes);
  };

  //get note from db at initial render
  useEffect(() => {
    onLoadNotes();
  }, []);

  const onLoadNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://noteaapp.onrender.com/notes");

      if (response.status === 404) {
        setNote([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      console.log(data);
      setNote(data);

      setDisplayNote(data);
    } catch (err) {
      console.error(err);
      setNote([]);
      setDisplayNote([]);
    } finally {
      setIsLoading(false);
    }
  };

  //filtering and set archieved notes
  useEffect(() => {
    const archived = note.filter((n) => Boolean(n.archieve));
    setArchieveNotes(archived);
  }, [note]);

  //filtering and setPinned Notes
  useEffect(() => {
    const pinned = note.filter((n) => Boolean(n.pinned));
    setPinnedNote(pinned);
  }, [note]);

  useEffect(() => {
    setDisplayNote(showArchieve ? archieveNotes : note);
  }, [showArchieve, archieveNotes, note]);

  const filtered = showArchieve
    ? displayNote
    : displayNote.filter((note) => !note.archieve);
  console.log(filtered);

  const others = React.useMemo(() => {
    return filtered.filter((note) => !pinnedNote.some((p) => p.ID === note.ID));
  }, [filtered, pinnedNote]);

  //toggle pin and archieve

  const toggledPinAndArchieve = async (ID, field) => {
    const noteToUpdate = note.find((n) => n.ID === ID);
    console.log(noteToUpdate);
    if (!noteToUpdate) return;

    let updatePinned = noteToUpdate.pinned;
    console.log(updatePinned);
    let updateArchieve = noteToUpdate.archieve;

    if (field === "pinned") {
      updatePinned = !noteToUpdate.pinned;
      if (updatePinned && noteToUpdate.archieve) {
        // If pinning an archived note, unarchive it
        updateArchieve = false;
      }
    } else if (field === "archieve") {
      updateArchieve = !noteToUpdate.archieve;
      if (updateArchieve) {
        updatePinned = false;
      }
    }

    const updatedNote = {
      ...noteToUpdate,
      pinned: updatePinned,
      archieve: updateArchieve,
    };

    try {
      const apiUrl = `https://noteaapp.onrender.com/notes/${ID}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updatedNote),
      });
      if (!response.ok) throw new Error("Failed to update status");

      setNote((prev) => prev.map((n) => (n.ID === ID ? updatedNote : n)));
      setDisplayNote((prev) =>
        prev.map((n) => (n.ID === ID ? updatedNote : n))
      );

      await onLoadNotes();
      // Update pinnedNote list
      setPinnedNote((prevPinned) => {
        if (updatePinned) {
          // Add if not already present
          if (!prevPinned.some((n) => n.ID === ID)) {
            return [...prevPinned, updatedNote];
          }
          return prevPinned;
        } else {
          // Remove if unpinned
          return prevPinned.filter((n) => n.ID !== ID);
        }
      });

      if (field === "archieve") {
        setArchieveNotes((prevArchieved) => {
          if (updateArchieve) {
            if (!prevArchieved.some((n) => n.ID === ID)) {
              return [...prevArchieved, updateArchieve];
            }
            return prevArchieved;
          } else {
            return prevArchieved.filter((n) => n.ID !== ID);
          }
        });
        setPinnedNote((prevPinned) => {
          if (prevPinned.some((note) => note.ID === ID)) {
            return prevPinned.filter((note) => note.ID !== ID);
          }
          return prevPinned; //
        });
      }
    } catch (error) {
      console.error(error);
    
  }
};

  //handle submit
  const submit = async (e) => {
    e.preventDefault();
    setSuccessMessage(true);

    if (editingId !== null) {
      console.log(editingId);
      setIsLoading(true);
      try {
        const apiUrl = `https://noteaapp.onrender.com/notes/${editingId}`;
        const response = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(form),
        });
        // console.log(response.json())
        if (!response.ok) throw new Error("Failed to update");
        {
          showArchieve
            ? setArchieveNotes((prev) =>
                prev.map((note) =>
                  note.ID === editingId
                    ? {
                        ...note,
                        ...form,
                        last_edited: new Date().toISOString(),
                      }
                    : note
                )
              )
            : setNote((prev) =>
                prev.map((note) =>
                  note.ID === editingId
                    ? {
                        ...note,
                        ...form,
                        last_edited: new Date().toISOString(),
                      }
                    : note
                )
              );
        }
        setDisplayNote(
          showArchieve
            ? (prev) =>
                prev.map((note) =>
                  note.ID === editingId
                    ? {
                        ...note,
                        ...form,
                        last_edited: new Date().toISOString(),
                      }
                    : note
                )
            : (prev) =>
                prev.map((note) =>
                  note.ID === editingId
                    ? {
                        ...note,
                        ...form,
                        last_edited: new Date().toISOString(),
                      }
                    : note
                )
        );
        setForm({ date: "", heading: "", text: "", priority: "" });
        setEditingId(null);
        setVisible(false);
        setSuccessMessage(false);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsLoading(true);
      const apiUrl = "https://noteaapp.onrender.com/notes";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
      }
      const data = await response.json();
      console.log(data);
      setApiMessage(data.message);
      setForm({ date: "", heading: "", text: "", priority: "" });
      setTimeout(() => {
        setVisible(false);
        setSuccessMessage(false);
        setApiMessage("");
        setIsLoading(false);
      }, 500);
      setTimeout(() => {
        onLoadNotes();
      }, 500);
    }
  };

  //handle delete
  const handleDelete = async (ID) => {
    try {
      if (!ID) {
        console.error("No ID passed to delete");
        return;
      }

      const apiUrl = `https://noteaapp.onrender.com/notes/${ID}`;
      await fetch(apiUrl, {
        method: "DELETE",
      });

      await onLoadNotes();
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  //HandleEdit
  const handleEdit = (note) => {
    setForm({
      date: note.date,
      heading: note.heading,
      text: note.text,
      priority: note.priority,
    });
    setEditingId(note.ID);
  };

  const handlesort = () => {
    setSortVisible((prev) => !prev);
  
  } 
  const sortbycreatedDate = () => {
    if (showArchieve) {
      const sortedArchives = [...archieveNotes].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setArchieveNotes(sortedArchives);
    } else {
         const sortedPinned = [...pinnedNote].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const sortedOthers = [...others].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setDisplayNote(sortedOthers)
    setPinnedNote(sortedPinned)
    }
  };

  const sortbymodifiedDate = () => {
    if (showArchieve) {
      const sortedArchives = [...archieveNotes].sort(
        (a, b) => new Date(b.last_edited) - new Date(a.last_edited)
      );
      setArchieveNotes(sortedArchives);
    } else {
       const sortedPinned = [...pinnedNote].sort(
      (a, b) => new Date(b.last_edited) - new Date(a.last_edited)
    );
    const sortedOthers = [...others].sort(
      (a, b) => new Date(b.last_edited) - new Date(a.last_edited)
    )
    setDisplayNote(sortedOthers)
    setPinnedNote(sortedPinned)
    }
  };
  
  
  console.log(showArchieve);

  const handleMoreFeatures = (id) => {
    setMoreFeatures((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  //handle Pinned Notes

  // const others = displayNote.filter(
  //   (note) => !pinnedNote.some((pinned) => pinned.ID === note.ID)
  // );

  //return jsx
  return (
    <div className="w-[100%]  overflow-hidden  realtive ">
      <div className=" px-12  w-full h-full flex flex-row justify-between items-center mt-2">
        <div className="">
          <h2 className="text-xl md:text-2xl font-mono">Hello User</h2>
          <h1 className="ml-2 pl-2  text-xl md:text-2xl font-mono font-semibold">
            Your Notes-
          </h1>
        </div>
        <div className=" flex justify-evenly items-center gap-3">
          <Tooltip
            title={
              showArchieve
                ? "Move to UnArchieved Notes"
                : "Move to Archieved Note"
            }
          >
            {archieveIcon ? (
              <ArchiveIcon
                sx={{ width: 35, height: 36 }}
                onClick={() => {
                  setShowArchieve((prev) => !prev);
                  setArchieveIcon((prev) => !prev);
                }}
              />
            ) : (
              <UnarchiveIcon
                sx={{ width: 35, height: 36 }}
                onClick={() => {
                  setShowArchieve((prev) => !prev);
                  setArchieveIcon((prev) => !prev);
                }}
              />
            )}
          </Tooltip>
          <ShareIcon sx={{ width: 35, height: 36 }} />
          <PersonPinIcon sx={{ width: 35, height: 36 }} />
        </div>
      </div>
      <div className='mx-auto'>
      <SearchIcon
        sx={{ width: "30px", height: "30px" }}
        className="relative left-10 "
      />
      <input
        className=" text-[10px] sm:text-[14px] md:text-xl pl-10 rounded-[20px] mx-auto mt-8 w-[75%] h-12 md:w-[80%] lg:w-[90%] md:h-16 border-2 border-black-400 px-2"
        type="search"
        value={searchInputValue}
        onChange={handleSearch}
        placeholder="Search Note"
      />
       <div className="absolute top-25 right-32  sm:top-25 md:top-28 sm:right-34 md:right-42  flex space-x-4 z-50  p-2 " >
        {iconView ? (
          <GridViewIcon
            sx={{ width: "25px", height: "25px" }}
            
            onClick={toggleIconView}
          />
        ) : (
          <HorizontalSplitIcon
            sx={{ width: "25px", height: "25px" }}
            onClick={toggleIconView}
            // className=" absolute right-46 md:right-50 bottom-5 "
          />
        )}
        <SwapVertIcon
          sx={{ width: "25px", height: "25px" }}
          onClick={handlesort}
        //   className=" absolute right-38 md:right-40 bottom-5"
        />
      </div>

      <button
        className=" ml-2 w-12 h-12 md:w-16 md:h-16 rounded-[40%] border-2 "
        onClick={() => {
          setVisible(true);
          setEditingId(null);
        }}
      >
        <AddIcon />
      </button>
      </div>
     
      {showArchieve
        ? ""
        : pinnedNote.length !== 0 && (
            <>
              <div className="mt-2 mb-2 bg-amber-100 w-[90%] ml-6 md:w-[90%]  text-left pl-2">
                <p className="font-semibold">Pinned Notes</p>
              </div>

              {pinnedNote.length > 0 ? (
                <div
                  className={`${iconView ? "flex-col" : "flex-wrap"} flex justify-center items-center mx-auto max-w-[1200px]`}
                >
                  {showArchieve
                    ? ""
                    : pinnedNote.map((eachNote) => {
                        const isPinned = pinnedNote.some(
                          (pinned) => pinned.ID === eachNote.ID
                        );
                        return (
                          <NoteCard
                            key={eachNote.ID}
                            eachNote={eachNote}
                            handleEdit={(note) => {
                              handleEdit(note);
                              setVisible(true);
                            }}
                            handleDelete={handleDelete}
                            handleMoreFeatures={handleMoreFeatures}
                            moreFeatures={moreFeatures}
                            archieveIcon={archieveIcon}
                            showArchieve={showArchieve}
                            isPinned={isPinned}
                            pinnedNote={pinnedNote}
                            // handleNoteColor={handleNoteColor}
                            setShowColorPicker={setShowColorPicker}
                            showColorPicker={showColorPicker}
                            cardColor={cardColor}
                            setCardColor={setCardColor}
                            setEditing={setEditingId}
                            toggledPinAndArchieve={toggledPinAndArchieve}
                          />
                        );
                      })}
                </div>
              ) : (
                <p className="text-center text-gray-400">No pinned notes yet</p>
              )}
            </>
          )}

      {visible && (
        <div className="fixed left-0 top-50  z-1000 flex w-full h-full  flex-col  justify-center items-center">
          <form
            className=" relative text-center shadow-xl h-w[300px] w-[350px] md:h-[450px] mt-10 p-3 md:w-[500px] border-1 bg-amber-50  rounded-[8px] m-auto"
            onSubmit={submit}
          >
            <CloseIcon
              className=" absolute right-4"
              onClick={() => setVisible(false)}
            />

            <label
              className=" block text-left  pl-6 text-[20px]"
              htmlFor="date"
            >
              Date{" "}
            </label>
            <input
              required
              onChange={handleChange}
              value={form.date}
              className=" rounded-[6px] border-2 m-1 w-[90%] pl-2"
              id="date"
              type="date"
              name="date"
            />

            <label
              className=" block text-left  pl-6 text-[20px]"
              htmlFor="heading"
            >
              Heading 
            </label>
            <input
              required
              onChange={handleChange}
              value={form.heading}
              className=" rounded-[6px] border-2 pl-2 m-1 w-[90%]"
              id="heading"
              type="text"
              name="heading"
            />
            <label className=" block text-left pl-6 text-[20px]" htmlFor="text">
              Text
            </label>

            <textarea
              required
              onChange={handleChange}
              value={form.text}
              className=" rounded-[6px] border-2 p-2 m-1 w-[90%]"
              id="text"
              rows="4"
              cols="50"
              name="text"
            ></textarea>

            <label
              htmlFor="importance"
              className="block text-left pl-6 text-[20px]"
            >
              Priority
            </label>
            <select
              value={form.priority}
              onChange={handleChange}
              className="rounded-[6px] border-2 pl-2 m-1 w-[90%] "
              name="priority"
              id="importance"
              required
            >
              <option value="" disabled>
                --select priority--
              </option>
              <option value="Important">Important</option>
              <option value="Not so important">Not so important</option>
            </select>
            <button
              className="w-[120px] h-10 m-auto mt-3 rounded-[12px] bg-black text-white "
              type="submit"
            >
              {editingId !== null ? "save" : "Add"}
            </button>

            {successMesssage && (
              <p className="text-green-500 mb-2">{apiMessage}</p>
            )}
          </form>
        </div>
      )}
      {others.length !== 0 && (
        <>
          <div className="mt-2 mb-2 bg-amber-100 w-[90%] ml-6 md:w-[90%] text-left pl-2  ">
            <p className="font-semibold">
              {showArchieve ? "Archieves" : "others"}
            </p>
          </div>

          <div
            className="h-[68vh] overflow-y-auto [&::-webkit-scrollbar]:hidden  w-full   max-w-[1200px] mx-auto scroll-smooth
"
          >
            {isLoading ? (
              <p className="text-2xl text-center">Loading...</p>
            ) : displayNote.length > 0 ? (
              <div
                className={`${iconView ? "flex-col   " : "flex-wrap"}   scrollbar-gutter-stable  w-full flex justify-center items-center      `}
              >
                {displayNote.length === 0 && (
                  <p className="mt-4 text-2xl">No Note Found</p>
                )}
                {others.map((eachNote) => (
                  <NoteCard
                    key={eachNote.ID}
                    eachNote={eachNote}
                    handleEdit={(note) => {
                      handleEdit(note);
                      setVisible(true);
                    }}
                    handleDelete={handleDelete}
                    handleMoreFeatures={handleMoreFeatures}
                    moreFeatures={moreFeatures}
                    archieveIcon={archieveIcon}
                    showArchieve={showArchieve}
                    others={others}
                    setShowColorPicker={setShowColorPicker}
                    showColorPicker={showColorPicker}
                    cardColor={cardColor}
                    setCardColor={setCardColor}
                    setEditing={setEditingId}
                    toggledPinAndArchieve={toggledPinAndArchieve}
                  />
                ))}{" "}
              </div>
            ) : (
              <p className="mt-4 text-2xl">No note available</p>
            )}
          </div>
        </>
      )}
      <div
        className={`
    fixed bottom-0 left-0 right-0 z-50
    transform  transition-all duration-500 ease-in-out
    ${sortVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
  `}
      >
        <div className=" bg-amber-50 mx-6  w-[90%]  md:w-[96%]  px-6 border-1 shadow-2lg border-gray-100 rounded-tl-[20px] rounded-tr-[20px]">
          <h3 className=" text-left mt-4 h-10 font-mono">Sort by</h3>
          <hr />
          <div className=" text-left flex flex-col leading-10 h-30">
            <p
              className={`font-mono pl-2  mt-1 cursor-pointer ${activesort === "dateCreated" ? "bg-pink-100" : ""}`}
              onClick={() => {
                sortbycreatedDate();
                setActiveSort("dateCreated");
              }}
            >
              Date Created
            </p>
            <p
              className={`font-mono pl-2 cursor-pointer ${activesort === "dateModified" ? "bg-pink-100" : ""}`}
              onClick={() => {
                sortbymodifiedDate();
                setActiveSort("dateModified");
              }}
            >
              Date Modified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 