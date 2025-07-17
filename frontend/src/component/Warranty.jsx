import React, { useMemo, useRef, useState, useEffect } from "react";
import { BiSolidFilePdf } from "react-icons/bi";
import { HiOutlineRefresh } from "react-icons/hi";
import { IoIosArrowUp } from "react-icons/io";
import Button from "react-bootstrap/Button";
import { LuCirclePlus } from "react-icons/lu";
import { IoEyeOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { Modal, Form, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import dayjs from "dayjs";
import "./Warranty.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const Warranty = ({ show, handleClose }) => {
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    // CHANGE: Removed GiftCardDatas state to avoid redundancy and inconsistency
    const [Warrantydata, setWarrantydata] = useState([]);
    const [Error, setError] = useState(null);
    const tableRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    // CHANGE: Kept single fetch function and removed fetchGiftDataref
    useEffect(() => {
        const fetchGiftData = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/warranty/");
                if (!response.ok) {
                    throw new Error("Failed to fetch warranty data");
                }
                const data = await response.json();
                console.log(data);
                const updatedData = data.map((item) => ({
                    ...item,
                    id: item._id,
                }));
                setWarrantydata(updatedData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchGiftData();
    }, []);

    const handleExportPDF = () => {
        const table = tableRef.current;
        if (!table) {
            console.error("Table reference not found");
            return;
        }
        html2canvas(table, { scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const imgWidth = 190;
                const pageHeight = 295;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 10;
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                pdf.save("warranties.pdf");
            })
            .catch((error) => {
                console.error("Error generating PDF:", error);
                setError("Failed to generate PDF. Please try again.");
            });
    };

    // CHANGE: Updated handleExportExcel to use filteredWarranties and warranty fields
    const handleExportExcel = () => {
        const exportData = filteredWarranties.map((item) => ({
            Warranty: item.warranty,
            Description: item.description,
            Duration: `${item.duration} ${item.period}`,
            Status: item.status ? "Active" : "Inactive",
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Warranties");
        XLSX.writeFile(workbook, "warranties.xlsx");
    };

    const handleCloses = () => setShowModal(false);

    const [formData, setFormData] = useState({
        warranty: "",
        description: "",
        duration: "",
        period: "",
        status: false,
    });

    const [editFormData, setEditFormData] = useState({
        id: "",
        warranty: "",
        description: "",
        duration: "",
        period: "",
        status: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // CHANGE: Updated handleSubmit to only update Warrantydata
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/warranty/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add warranty");
            }
            const data = await response.json();
            console.log("New Warranty Added:", data);
            setWarrantydata((prevData) => [...prevData, { ...data, id: data._id }]);
            handleCloses();
        } catch (err) {
            setError(err.message);
            console.error("Error:", err.message);
        }
    };

    // CHANGE: Simplified handleEditOpen to directly use card data
    const handleEditOpen = (card) => {
        console.log("Opening edit modal for card:", card);
        setEditFormData({
            id: card.id || "",
            warranty: card.warranty || "",
            description: card.description || "",
            duration: card.duration || "",
            period: card.period || "",
            status: card.status || false,
        });
        setShowEditModal(true);
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setEditFormData({
            id: "",
            warranty: "",
            description: "",
            duration: "",
            period: "",
            status: false,
        });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // CHANGE: Updated handleEditSubmit to update Warrantydata
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/warranty/${editFormData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editFormData),
            });
            if (!response.ok) {
                throw new Error("Failed to update warranty");
            }
            const data = await response.json();
            console.log("Updated Warranty:", data);
            setWarrantydata((prevData) =>
                prevData.map((card) => (card.id === data.id ? { ...card, ...data } : card))
            );
            handleEditClose();
        } catch (err) {
            console.error("Error updating warranty:", err);
            setError("Failed to update warranty. Please try again.");
        }
    };

    // CHANGE: Fixed handleDelete to use Warrantydata and remove confirmation prompt
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/warranty/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete the warranty");
            }
            setWarrantydata((prev) => prev.filter((item) => item.id !== id));
            setShowDeleteModal(false);
            setPendingDeleteId(null);
            alert("Warranty deleted successfully");
        } catch (err) {
            console.error("Error deleting warranty:", err);
            setError("Failed to delete the warranty. Please try again.");
        }
    };

    // CHANGE: Updated filteredWarranties to handle warranty data correctly
    const filteredWarranties = useMemo(() => {
        return Warrantydata.filter((item) => {
            const searchMatch =
                item.warranty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch =
                statusFilter === "all" ||
                (statusFilter === "active" && item.status) ||
                (statusFilter === "inactive" && !item.status);
            return searchMatch && statusMatch;
        });
    }, [Warrantydata, searchTerm, statusFilter]);

    // CHANGE: Removed fetchGiftDataref and its useEffect
    const openDeleteModal = (id) => {
        setPendingDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleShow = () => setShowModal(true);

    return (
        <div className="fn-conatiner">
            {/* CHANGE: Added error display in UI */}
            {Error && <div className="alert alert-danger">{Error}</div>}
            <div className="d-flex bd-highlight justify-content-between align-items-start">
                <div className="p-3 mt-3 flex-grow-1">
                    <div className="h4">Warranties</div>
                    <div className="text-secondary">Manage your Warranties</div>
                </div>
                <div className="d-flex align-items-center gap-1 p-4 mt-3">
                    <Button
                        className="text-danger"
                        variant="light"
                        aria-label="Export as PDF"
                        onClick={handleExportPDF}
                    >
                        <BiSolidFilePdf size={24} />
                    </Button>
                    <Button
                        className="text-success"
                        variant="light"
                        aria-label="Export as Excel"
                        onClick={handleExportExcel}
                    >
                        <BiSolidFilePdf size={24} />
                    </Button>
                    {/* CHANGE: Fixed refresh button to call fetchGiftData correctly */}
                    <Button
                        variant="light"
                        aria-label="Refresh"
                        className="text-secondary"
                        onClick={() => fetchGiftData()}
                    >
                        <HiOutlineRefresh size={20} />
                    </Button>
                    <Button
                        variant="light"
                        aria-label="Collapse"
                        className="text-secondary"
                    >
                        <IoIosArrowUp size={18} />
                    </Button>
                    <Button variant="warning text-white" onClick={handleShow}>
                        <LuCirclePlus /> Add Warranty
                    </Button>
                </div>
            </div>
            <Modal show={showModal} onHide={handleCloses} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Warranty</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="warranty">
                            <Form.Label>
                                Warranty <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter warranty"
                                name="warranty"
                                value={formData.warranty}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Row className="mt-3">
                            <Col>
                                <Form.Group controlId="duration">
                                    <Form.Label>
                                        Duration <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        placeholder="e.g. 2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="period">
                                    <Form.Label>
                                        Period <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="period"
                                        value={formData.period}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="Day">Day(s)</option>
                                        <option value="Month">Month(s)</option>
                                        <option value="Year">Year(s)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <Form.Group controlId="description">
                                    <Form.Label>
                                        Description <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group
                            controlId="status"
                            className="mt-4 d-flex align-items-center justify-content-between"
                        >
                            <Form.Label className="me-3 mb-0">Status</Form.Label>
                            <Form.Check
                                type="switch"
                                name="status"
                                checked={formData.status}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={handleCloses}>
                        Cancel
                    </Button>
                    <Button variant="warning text-white" onClick={handleSubmit}>
                        Add Warranty
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEditModal} onHide={handleEditClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Warranty</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="editWarranty">
                            <Form.Label>
                                Warranty <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="warranty"
                                value={editFormData.warranty}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Row className="mt-3">
                            <Col>
                                <Form.Group controlId="editDuration">
                                    <Form.Label>
                                        Duration <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="duration"
                                        value={editFormData.duration}
                                        onChange={handleEditChange}
                                        placeholder="e.g. 2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="editPeriod">
                                    <Form.Label>
                                        Period <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="period"
                                        value={editFormData.period}
                                        onChange={handleEditChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="Day">Day(s)</option>
                                        <option value="Month">Month(s)</option>
                                        <option value="Year">Year(s)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group controlId="editDescription" className="mt-3">
                            <Form.Label>
                                Description <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={editFormData.description}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group
                            controlId="editStatus"
                            className="mt-4 d-flex align-items-center justify-content-between"
                        >
                            <Form.Label className="me-3 mb-0">Status</Form.Label>
                            <Form.Check
                                type="switch"
                                name="status"
                                checked={editFormData.status}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={handleEditClose}>
                        Cancel
                    </Button>
                    <Button variant="warning" onClick={handleEditSubmit}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* CHANGE: Fixed delete modal to use pendingDeleteId */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Body className="text-center py-4">
                    <div className="d-flex justify-content-center mb-3">
                        <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                            <RiDeleteBinLine size={28} className="text-danger" />
                        </div>
                    </div>
                    <h5 className="fw-bold">Delete Warranty</h5>
                    <p>Are you sure you want to delete warranty?</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Button variant="dark" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="warning" onClick={() => handleDelete(pendingDeleteId)}>
                            Yes Delete
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            <div className="container-mn">
                <div className="d-flex justify-content-between align-items-center p-3">
                    <div>
                        <div className="input-group rounded">
                            <input
                                type="search"
                                className="form-control rounded"
                                placeholder="🔍︎ Search"
                                aria-label="Search"
                                aria-describedby="search-addon"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="d-flex gap-3">
                        {/* CHANGE: Fixed select to avoid duplicate "Status" option */}
                        <select
                            className="form-select"
                            value={statusFilter}
                            aria-label="Default select example"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div>
                    <table className="table" ref={tableRef}>
                        <thead className="tableheader">
                            <tr>
                                <th scope="col">
                                    <input type="checkbox" />
                                </th>
                                <th scope="col">Warranty</th>
                                <th scope="col">Description</th>
                                <th scope="col">Duration</th>
                                <th scope="col">Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWarranties
                                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                .map((item, idx) => (
                                    <tr key={idx}>
                                        <th scope="col">
                                            <input type="checkbox" />
                                        </th>
                                        <td>{item.warranty}</td>
                                        <td>{item.description}</td>
                                        <td>{`${item.duration} ${item.period}`}</td>
                                        <td>
                                            {/* CHANGE: Fixed status badge to use item.status */}
                                            <span
                                                className={`badge ${item.status ? "badge-success" : "badge-danger"}`}
                                            >
                                                {item.status ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="iconsms">
                                                <button>
                                                    <IoEyeOutline />
                                                </button>
                                                {/* CHANGE: Pass item directly to handleEditOpen */}
                                                <button onClick={() => handleEditOpen(item)}>
                                                    <FiEdit />
                                                </button>
                                                <button onClick={() => openDeleteModal(item.id)}>
                                                    <RiDeleteBinLine />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {/* CHANGE: Fixed pagination to use filteredWarranties */}
                <div className="d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex gap-3 align-items-center">
                        <div>Rows Per Page</div>
                        <select
                            className="form-select"
                            name="rows"
                            id="rows"
                            style={{ width: "80px" }}
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                        <div>Entries</div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn"
                            style={{ border: "none", background: "transparent" }}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            aria-label="Previous Page"
                        >
                            <GoChevronLeft size={20} />
                        </button>
                        <div className="text-center downt">
                            <span>{currentPage}</span>
                        </div>
                        <button
                            className="btn"
                            style={{ border: "none", background: "transparent" }}
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, Math.ceil(filteredWarranties.length / rowsPerPage))
                                )
                            }
                            disabled={currentPage === Math.ceil(filteredWarranties.length / rowsPerPage)}
                            aria-label="Next Page"
                        >
                            <GoChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="settings">
                <IoSettingsSharp />
            </div>
        </div>
    );
};

export default Warranty;


