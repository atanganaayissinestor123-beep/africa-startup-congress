import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import RichTextEditor from "../components/RichTextEditor";
import useEmails from "../hooks/useEmails";
import { sendEmails } from "../lib/email";

type Newsletter = {
  id: number;
  title: string;
  subtitle?: string;
  content: string;
  events: string[];
  status: string;
  event_datetime: string;
  link?: string;
  created_at?: string;
};

type ModalMode = "create" | "edit" | "preview" | "delete" | null;

const emptyForm = {
  title: "",
  subtitle: "",
  content: "",
  events: "",
  event_datetime: "",
  link: "",
};

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Newsletter | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { emails, fetchEmails } = useEmails();

  const fetchNewsletters = async () => {
    const { data } = await supabase
      .from("newsletters")
      .select("*")
      .order("created_at", { ascending: false });

    setNewsletters(data || []);
  };

  useEffect(() => {
    fetchNewsletters();
    fetchEmails();
  }, []);

  const filtered = newsletters.filter((n) => {
    const q = search.trim().toLowerCase();

    return (
      n.title.toLowerCase().includes(q) ||
      n.events?.some((e) => e.toLowerCase().includes(q)) ||
      false
    );
  });

  const openCreate = () => {
    setForm(emptyForm);
    setSelected(null);
    setMode("create");
  };

  const openEdit = (n: Newsletter) => {
    setSelected(n);
    setForm({
      title: n.title,
      subtitle: n.subtitle || "",
      content: n.content,
      events: n.events?.join(", ") || "",
      event_datetime: n.event_datetime?.slice(0, 16) || "",
      link: n.link || "",
    });
    setMode("edit");
  };

  const openPreview = (n: Newsletter) => {
    setSelected(n);
    setMode("preview");
  };

  const openDelete = (n: Newsletter) => {
    setSelected(n);
    setMode("delete");
  };

  const openPublish = (n: Newsletter) => {
	setSelected(n);
	sendEmails(
    emails,
    {
      title: n.title,
      subtitle: n.subtitle || "",
      content: n.content,
      event: n.events?.join(", ") || "",
      event_datetime: n.event_datetime?.slice(0, 16) || "",
      link: n.link || "",
    },
    n.id,
    fetchNewsletters,
  );
	console.log("PUBLISHED",n);
	
}

  const closeModal = () => {
    setMode(null);
    setSelected(null);
  };


  const handleCreate = async () => {
    const { error } = await supabase.from("newsletters").insert([
      {
        title: form.title,
        subtitle: form.subtitle || null,
        content: form.content,
        events: form.events
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        event_datetime: form.event_datetime,
        link: form.link || null,
      },
    ]);

    if (error) return toast.error("Failed to create newsletter");

    toast.success("Newsletter created");
    closeModal();
    fetchNewsletters();
  };

  const handleUpdate = async () => {
    if (!selected) return;

    const { error } = await supabase
      .from("newsletters")
      .update({
        title: form.title,
        subtitle: form.subtitle || null,
        content: form.content,
        events: form.events
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        event_datetime: form.event_datetime,
        link: form.link || null,
      })
      .eq("id", selected.id);

    if (error) return toast.error("Failed to update newsletter");

    toast.success("Newsletter updated");
    closeModal();
    fetchNewsletters();
  };

  const handleDelete = async () => {
    if (!selected) return;

    const { error } = await supabase
      .from("newsletters")
      .delete()
      .eq("id", selected.id);

    if (error) return toast.error("Failed to delete newsletter");

    toast.success("Newsletter deleted");
    closeModal();
    fetchNewsletters();
  };

  return (
    <div className="bg-white shadow-2xl overflow-hidden border border-gray-100 w-full max-w-7xl mx-auto rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-[#001F54]">Newsletters</h2>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#001F54] hover:bg-[#002f7a] text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
        >
          Create newsletter
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search by title or event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-100 table-fixed">
          <thead className="bg-[#001F54]">
            <tr>
              <th className="px-5 py-3 text-gray-200 text-left text-xs">
                Title
              </th>
              <th className="px-5 py-3 text-gray-200 text-left text-xs">
                Events
              </th>
              <th className="px-5 py-3 text-gray-200 text-left text-xs">
                Status
              </th>
              <th className="px-5 py-3 text-gray-200 text-left text-xs">
                Date
              </th>
              <th className="px-5 py-3 text-gray-200 text-left text-xs">
                Link
              </th>
              <th className="px-5 py-3 text-gray-200 text-right text-xs">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-sm text-gray-400"
                >
                  No newsletters found.
                </td>
              </tr>
            )}

            {filtered.map((n) => {
              const date = n.event_datetime ? new Date(n.event_datetime) : null;

              return (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {n.title}
                    </p>
                    {n.subtitle && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {n.subtitle}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {n.events?.map((ev) => (
                        <span
                          key={ev}
                          className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-800"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs uppercase font-bold ${n.status === 'published' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{n.status}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3 text-xs text-gray-500">
                    {date ? (
                      <>
                        {date.toLocaleDateString()}
                        <br />
                        {date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-5 py-3">
                    {n.link ? (
                      <a
                        href={n.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline block max-w-[160px] truncate"
                      >
                        {n.link}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <ActionBtn
                        title="Preview"
                        color="blue"
                        onClick={() => openPreview(n)}
                        icon={<EyeIcon />}
                      />
                      <ActionBtn
                        title="Edit"
                        color="amber"
                        onClick={() => openEdit(n)}
                        icon={<EditIcon />}
                      />
                      <ActionBtn
                        title="Delete"
                        color="red"
                        onClick={() => openDelete(n)}
                        icon={<TrashIcon />}
                      />
                      <button
                        onClick={() => openPublish(n)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Publish
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {(mode === "create" || mode === "edit") && (
        <Modal
          title={mode === "create" ? "Create newsletter" : "Edit newsletter"}
          onClose={closeModal}
        >
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border p-2 mb-2"
          />

          <input
            placeholder="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full border p-2 mb-2"
          />

          <RichTextEditor
            value={form.content}
            onChange={(val) => setForm({ ...form, content: val })}
          />

          <input
            placeholder="Events (comma separated)"
            value={form.events}
            onChange={(e) => setForm({ ...form, events: e.target.value })}
            className="w-full border p-2 mb-2"
          />

          <input
            type="datetime-local"
            value={form.event_datetime}
            onChange={(e) =>
              setForm({ ...form, event_datetime: e.target.value })
            }
            className="w-full border p-2 mb-2"
          />

          <input
            placeholder="Link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full border p-2 mb-4"
          />

          <div className="flex justify-end gap-2">
            <button onClick={closeModal}>Cancel</button>
            <button
              onClick={mode === "create" ? handleCreate : handleUpdate}
              className="bg-[#001F54] text-white px-4 py-2"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
      {mode === "preview" && selected && (
        <Modal title="Preview newsletter" onClose={closeModal}>
          <h2 className="text-lg font-bold text-[#001F54] mb-2">
            {selected.title}
          </h2>

          {selected.subtitle && (
            <p className="text-sm text-gray-500 mb-2">{selected.subtitle}</p>
          )}

          <div
            className="prose prose-sm max-w-none border-t pt-3"
            dangerouslySetInnerHTML={{ __html: selected.content }}
          />

          <hr className="my-4 border-gray-200" />

          <h2 className="text-md font-semibold text-[#001F54] mb-2">
            Upcoming Events
          </h2>

          <div className="flex flex-wrap gap-1 my-3">
            {selected.events?.map((ev, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-blue-50 text-blue-800 rounded-full"
              >
                {ev}
              </span>
            ))}
          </div>

          {selected.event_datetime && (
            <div className="text-xs text-gray-500 mb-3">
              {new Date(selected.event_datetime).toLocaleString()}
            </div>
          )}

          {selected.link && (
            <a
              href={selected.link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-sm hover:underline block mt-4"
            >
              {selected.link}
            </a>
          )}
          <div className="flex justify-end mt-4">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm bg-gray-100 rounded"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
      {mode === "delete" && selected && (
        <Modal title="Delete newsletter" onClose={closeModal}>
          <p className="text-sm text-gray-700">
            Are you sure you want to delete:
          </p>

          <p className="font-semibold text-gray-900 mt-1 mb-4">
            {selected.title}
          </p>

          <p className="text-xs text-gray-400 mb-5">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm bg-gray-100 rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
      {/* Preview + Delete modals kept unchanged for brevity */}
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded">
        <div className="flex justify-between p-4 border-b">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function ActionBtn({ title, onClick, icon }: any) {
  return (
    <button onClick={onClick} title={title}>
      {icon}
    </button>
  );
}

const EyeIcon = () => <span>👁</span>;
const EditIcon = () => <span>✏️</span>;
const TrashIcon = () => <span>🗑</span>;
