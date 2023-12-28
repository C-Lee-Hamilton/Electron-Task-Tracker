import React, { useState, useEffect } from "react";
import "./App.css";

// Check if ipcRenderer is defined (indicating Electron environment)
const { ipcRenderer } = window;

function App() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (ipcRenderer) {
      ipcRenderer.on("update-tasks", (event, loadedTasks) => {
        setTasks(loadedTasks);
      });

      // Request tasks from the main process when the app starts
      ipcRenderer.send("get-tasks");

      // Cleanup the event listener when the component unmounts
      return () => {
        ipcRenderer.removeAllListeners("update-tasks");
      };
    }
  }, [ipcRenderer]);

  const handleInput = (e) => {
    setText(e.target.value);
  };

  const addTask = () => {
    if (text.trim() !== "") {
      const updatedTasks = [...tasks, { text, completed: false }];
      setTasks(updatedTasks);

      // Save updated tasks to the main process
      ipcRenderer.send("set-tasks", updatedTasks);

      setText("");
    }
  };

  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);

    // Save updated tasks to the main process
    ipcRenderer.send("set-tasks", updatedTasks);
  };

  const removeTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);

    // Save updated tasks to the main process
    ipcRenderer.send("set-tasks", updatedTasks);
  };

  return (
    <div className="App">
      <h1>Task Tracker</h1>
      <div className="task-input">
        <input
          type="text"
          value={text}
          onChange={(e) => handleInput(e)}
          placeholder="Add Task"
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {tasks.map((task, index) => (
          <li
            key={index}
            className={`task ${task.completed ? "completed" : ""}`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(index)}
              id={`checkbox-${index}`}
            />
            <label htmlFor={`checkbox-${index}`}>
              <span>{task.text}</span>
              <button onClick={() => removeTask(index)}>Remove</button>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
