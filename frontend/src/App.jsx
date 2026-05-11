import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("orta");
  const [dueDate, setDueDate] = useState("");
  const [assignedUnit, setAssignedUnit] = useState("");

  const [transferUnit, setTransferUnit] = useState("");
  const [transferNote, setTransferNote] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchUnits();
  }, []);

  const fetchTasks = () => {
    fetch("http://127.0.0.1:8000/api/tasks/")
      .then((response) => response.json())
      .then((data) => setTasks(data));
  };

  const fetchUnits = () => {
    fetch("http://127.0.0.1:8000/api/units/")
      .then((response) => response.json())
      .then((data) => {
        setUnits(data);

        if (data.length > 0) {
          setAssignedUnit(data[0].id);
          setTransferUnit(data[0].id);
        }
      });
  };

  const fetchTaskDetail = (taskId) => {
    fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`)
      .then((response) => response.json())
      .then((data) => setSelectedTask(data));
  };

  const beklemedeTasks = tasks.filter(
    (task) => task.status === "beklemede"
  );

  const devamTasks = tasks.filter(
    (task) => task.status === "devam"
  );

  const tamamTasks = tasks.filter(
    (task) => task.status === "tamam"
  );

  const createTask = (event) => {
    event.preventDefault();

    fetch("http://127.0.0.1:8000/api/tasks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        status: "beklemede",
        priority,
        due_date: dueDate,
        assigned_unit: assignedUnit,
      }),
    })
      .then((response) => response.json())
      .then((newTask) => {
        setTasks((prevTasks) => [...prevTasks, newTask]);

        setTitle("");
        setDescription("");
        setPriority("orta");
        setDueDate("");
      });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    })
      .then((response) => response.json())
      .then((updatedTask) => {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );

        setSelectedTask(updatedTask);
      });
  };

  const transferTask = (event) => {
    event.preventDefault();

    if (!selectedTask) return;

    fetch(
      `http://127.0.0.1:8000/api/tasks/${selectedTask.id}/transfer/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_unit_id: transferUnit,
          note: transferNote,
        }),
      }
    )
      .then((response) => response.json())
      .then(() => {
        fetchTasks();
        fetchTaskDetail(selectedTask.id);

        setTransferNote("");
      });
  };

  const renderTaskCard = (task) => {

    const isLate =
      task.status !== "tamam" &&
      new Date(task.due_date) < new Date();

    return (
      <div
        key={task.id}
        onClick={() => {
          fetchTaskDetail(task.id);
          setTransferUnit(task.assigned_unit);
        }}
        style={{
          border: "1px solid gray",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "10px",
          backgroundColor: isLate ? "#4a1e1e" : "#1e1e1e",
          cursor: "pointer",
        }}
      >
        <h3>{task.title}</h3>

        {isLate && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            GECİKMİŞ GÖREV
          </p>
        )}

        <p>{task.description}</p>

        <p>
          <strong>Öncelik:</strong> {task.priority}
        </p>

        <p>
          <strong>Birim:</strong> {task.assigned_unit_name}
        </p>

        <div style={{ marginTop: "10px" }}>
          {task.status !== "devam" && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                updateTaskStatus(task.id, "devam");
              }}
            >
              Devam Ediyor Yap
            </button>
          )}

          {task.status !== "tamam" && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                updateTaskStatus(task.id, "tamam");
              }}
              style={{ marginLeft: "8px" }}
            >
              Tamamla
            </button>
          )}

          {task.status !== "beklemede" && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                updateTaskStatus(task.id, "beklemede");
              }}
              style={{ marginLeft: "8px" }}
            >
              Beklemeye Al
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>
        Belediye Görev Paneli
      </h1>

      <form
        onSubmit={createTask}
        style={{
          backgroundColor: "#2a2a2a",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "25px",
        }}
      >
        <h2>Yeni Görev Oluştur</h2>

        <input
          type="text"
          placeholder="Görev başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginRight: "8px" }}
        />

        <input
          type="text"
          placeholder="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ marginRight: "8px" }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ marginRight: "8px" }}
        >
          <option value="dusuk">Düşük</option>
          <option value="orta">Orta</option>
          <option value="yuksek">Yüksek</option>
        </select>

        <select
          value={assignedUnit}
          onChange={(e) => setAssignedUnit(e.target.value)}
          style={{ marginRight: "8px" }}
        >
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          style={{ marginRight: "8px" }}
        />

        <button type="submit">Görev Ekle</button>
      </form>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#2a2a2a",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <h2>Beklemede</h2>

          {beklemedeTasks.map(renderTaskCard)}
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: "#2a2a2a",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <h2>Devam Ediyor</h2>

          {devamTasks.map(renderTaskCard)}
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: "#2a2a2a",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <h2>Tamamlandı</h2>

          {tamamTasks.map(renderTaskCard)}
        </div>
      </div>

      {selectedTask && (
        <div
          style={{
            marginTop: "25px",
            backgroundColor: "#2a2a2a",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <h2>Görev Detayı</h2>

          <p>
            <strong>Başlık:</strong> {selectedTask.title}
          </p>

          <p>
            <strong>Açıklama:</strong> {selectedTask.description}
          </p>

          <p>
            <strong>Durum:</strong> {selectedTask.status}
          </p>

          <p>
            <strong>Öncelik:</strong> {selectedTask.priority}
          </p>

          <p>
            <strong>Birim:</strong> {selectedTask.assigned_unit_name}
          </p>

          <h3 style={{ marginTop: "20px" }}>
            Görevi Devret
          </h3>

          <form onSubmit={transferTask}>
            <select
              value={transferUnit}
              onChange={(e) => setTransferUnit(e.target.value)}
              style={{ marginRight: "8px" }}
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Devir notu"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              style={{ marginRight: "8px" }}
            />

            <button type="submit">
              Görevi Devret
            </button>
          </form>

          <h3 style={{ marginTop: "20px" }}>
            Devir Geçmişi
          </h3>

          {selectedTask.transfer_history.length === 0 ? (
            <p>Henüz devir yapılmamış.</p>
          ) : (
            selectedTask.transfer_history.map((history) => (
              <div
                key={history.id}
                style={{
                  border: "1px solid gray",
                  borderRadius: "8px",
                  padding: "10px",
                  marginTop: "10px",
                  backgroundColor: "#1e1e1e",
                }}
              >
                <p>
                  <strong>Kimden:</strong>{" "}
                  {history.from_unit_name}
                </p>

                <p>
                  <strong>Kime:</strong>{" "}
                  {history.to_unit_name}
                </p>

                <p>
                  <strong>Tarih:</strong>{" "}
                  {history.transferred_at}
                </p>

                <p>
                  <strong>Not:</strong>{" "}
                  {history.note || "Not yok"}
                </p>
              </div>
            ))
          )}

          <button
            onClick={() => setSelectedTask(null)}
            style={{ marginTop: "15px" }}
          >
            Detayı Kapat
          </button>
        </div>
      )}
    </div>
  );
}

export default App;