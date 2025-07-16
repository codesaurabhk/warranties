
import React, { useMemo, useRef, useState } from "react";

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
import { GoChevronDown, GoChevronLeft, GoChevronRight } from "react-icons/go";
import { FiPlusCircle } from "react-icons/fi";
import dayjs from "dayjs";
import "./Warranty.css";
import html2canvas from "html2canvas";
import { useEffect } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const GiftCardData = [
    { id: "1", warranty: "On-site Warranty", description: "cover replacement of faulty items", duration: "2 years", Status: "Inactive" },
    { id: "2", warranty: "On-site Warranty", description: "cover replacement faulty items", duration: "2 years", Status: "Inactive" },
    { id: "3", warranty: "On-site Warranty", description: "cover replacement of faculty items", duration: "2 years", Status: "Inactive" },
    { id: "4", warranty: "On-site Warranty", description: "cover replacement of faulty items", duration: "2 years", Status: "Inactive" },
    { id: "5", warranty: "On-site Warranty", description: "cover replacement of faulty items", duration: "2 years", Status: "Inactive" },
    { id: "6", warranty: "On-site Warranty", description: "cover replacement faulty items", duration: "2 years", Status: "Inactive" },
    { id: "7", warranty: "On-site Warranty", description: "cover replacement of faulty items", duration: "2 years", Status: "Inactive" },
    { id: "8", warranty: "On-site Warranty", description: "cover replacement of faulty items", duration: "2 years", Status: "Active" },
];



const Warranty = ({ show, handleClose }) => {
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [GiftCardDatas, setGiftCardDatas] = useState([]);
    const [Error, setError] = useState(null);
    const tableRef = useRef(null);
    const [Customers, setCustomers] = useState([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOption, setSortOption] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);






    // useEffect(() => {
    //     const fetchGiftData = async () => {
    //         try {
    //             const response = await fetch("http://localhost:5000/api/giftcard/");
    //             if (!response.ok) {
    //                 throw new Error("Failed to fetch giftcard data");
    //             }
    //             const data = await response.json();
    //             console.log(data);
    //             const updatedData = data.map((item) => ({
    //                 ...item,
    //                 id: item._id,
    //             }));
    //             setGiftCardDatas(updatedData);
    //         } catch (err) {
    //             setError(err.message);
    //         }
    //     };

    //     fetchGiftData();
    // }, []);

    // useEffect(() => {
    //     const fetchCustomers = async () => {
    //         try {
    //             const response = await fetch("http://localhost:5000/api/customers/");
    //             if (!response.ok) {
    //                 throw new Error("Failed to fetch Customers data");
    //             }
    //             const data = await response.json();
    //             setCustomers(data);
    //         } catch (err) {
    //             setError(err.message);
    //         }
    //     };
    //     fetchCustomers();
    // }, []);



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
                pdf.save("gift_cards.pdf");
            })
            .catch((error) => {
                console.error("Error generating PDF:", error);
                setError("Failed to generate PDF. Please try again.");
            });
    };



    const handleExportExcel = () => {
        const exportData = filteredGiftCards.map((item) => ({
            "Gift Card": item.giftCard,
            "Customer": getCustomerName(item.customer),
            "Issued Date": dayjs(item.issuedDate).format("YYYY-MM-DD"),
            "Expiry Date": dayjs(item.expiryDate).format("YYYY-MM-DD"),
            "Amount": item.amount,
            "Balance": item.balance,
            "Status": item.status ? "Active" : "Inactive",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "GiftCards");

        XLSX.writeFile(workbook, "gift_cards.xlsx");
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (
        //     !formData.giftCard ||
        //     !formData.customer ||
        //     !formData.issuedDate ||
        //     !formData.expiryDate ||
        //     !formData.amount ||
        //     !formData.balance
        // ) {
        //     setError("All fields are required.");
        //     console.error("Form data is missing required fields:", formData);
        //     return;
        // }

        // try {
        //     const response = await fetch("http://localhost:5000/api/giftcard/", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify(formData),
        //     });

        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         console.error("API error:", errorData);
        //         throw new Error(errorData.message || "Failed to add gift card");
        //     }

        //     const data = await response.json();
        //     console.log("New Gift Card Added:", data);

        //     setGiftCardDatas((prevData) => [...prevData, data]);

        //     handleClose();
        // } catch (err) {
        //     setError(err.message);
        //     console.error("Error:", err.message);
        // }
    };

    const handleEditOpen = (card) => {
        console.log("Opening edit modal for card:", card); // Debug log
        try {
            const formattedData = toEditForm(card);
            setEditFormData(formattedData);
            setShowEditModal(true);
        } catch (error) {
            console.error("Error in handleEditOpen:", error);
        }
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

    const toEditForm = (row) => {
        console.log("Converting row to edit form:", row); // Debug log
        return {
            id: row.id || "",
            warranty: row.warranty || "",
            description: row.description || "",
            duration: row.duration || "",
            period: "", // Period is not in GiftCardData; set as empty
            status: row.Status === "Active",
        };
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const toISO = (prettyDate) => {
        const [d, mon, y] = prettyDate.split(" ");
        const m = ("JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(mon) / 3 + 1)
            .toString()
            .padStart(2, "0");
        return `${y}-${m}-${d.padStart(2, "0")}`;
    };

    // const handleEditSubmit = async (e) => {
    //     e.preventDefault();

    //     const updatedGiftCardData = {
    //         ...editFormData,
    //         issuedDate: dayjs(editFormData.issuedDate).format("YYYY-MM-DD"),
    //         expiryDate: dayjs(editFormData.expiryDate).format("YYYY-MM-DD"),
    //         amount: Number(editFormData.amount),
    //         balance: Number(editFormData.balance),
    //     };

    //     // try {
    //     //     const response = await fetch(
    //     //         `http://localhost:5000/api/giftcard/${editFormData.id}`,
    //     //         {
    //     //             method: "PUT",
    //     //             headers: {
    //     //                 "Content-Type": "application/json",
    //     //             },
    //     //             body: JSON.stringify(updatedGiftCardData),
    //     //         }
    //     //     );
    //     //     console.log("");

    //     //     if (!response.ok) {
    //     //         throw new Error("Failed to update gift card");
    //     //     }

    //     //     const data = await response.json();
    //     //     console.log("Updated Gift Card:", data);

    //     //     setGiftCardDatas((prevData) =>
    //     //         prevData.map((card) =>
    //     //             card.id === data.id ? { ...card, ...data } : card
    //     //         )
    //     //     );

    //     //     handleEditClose();
    //     // } catch (err) {
    //     //     console.error("Error updating gift card:", err);
    //     //     setError("Failed to update gift card. Please try again.");
    //     // }
    // };


    const handleEditSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting edit form:", editFormData); // Debug log
        const updatedWarranty = {
            ...editFormData,
            Status: editFormData.status ? "Active" : "Inactive",
        };
        setGiftCardDatas((prevData) =>
            prevData.map((card) =>
                card.id === updatedWarranty.id ? updatedWarranty : card
            )
        );
        handleEditClose();
    };
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this gift card?"
        );
        if (!confirmDelete) return;

        // try {
        //     const response = await fetch(`http://localhost:5000/api/giftcard/${id}`, {
        //         method: "DELETE",
        //     });

        //     if (!response.ok) {
        //         throw new Error("Failed to delete the gift card");
        //     }
        //     setGiftCardDatas((prevData) =>
        //         prevData.filter((card) => card._id !== id)
        //     );
        //     alert("Gift card deleted successfully");
        // } catch (err) {
        //     console.error("Error deleting gift card:", err);
        //     setError("Failed to delete the gift card. Please try again.");
        // }
    };

    const getCustomerName = (id) =>
        Customers.find((c) => c._id === id)?.addcustomers || "Unknown";

    const filteredGiftCards = useMemo(() => {
        const getCustomerName = (id) =>
            Customers.find((c) => c._id === id)?.addcustomers || "Unknown";

        const now = dayjs();
        const sevenDaysAgo = now.subtract(7, "day");
        const threeDaysAgo = now.subtract(3, "day");
        const twoDaysAgo = now.subtract(2, "day");
        const oneDaysAgo = now.subtract(1, "day");

        return GiftCardDatas.filter((item) => {
            const customerName = getCustomerName(item.customer);

            const searchMatch =
                item.giftCard.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customerName.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch =
                statusFilter === "all" ||
                (statusFilter === "active" && item.status) ||
                (statusFilter === "inactive" && !item.status);

            const sortMatch =
                sortOption === "all" ||
                (sortOption === "last7days" && dayjs(item.issuedDate).isAfter(sevenDaysAgo)) ||
                (sortOption === "last3days" && dayjs(item.issuedDate).isAfter(threeDaysAgo)) ||
                (sortOption === "last2days" && dayjs(item.issuedDate).isAfter(twoDaysAgo)) ||
                (sortOption === "last1days" && dayjs(item.issuedDate).isAfter(oneDaysAgo));

            return searchMatch && statusMatch && sortMatch;
        });
    }, [GiftCardDatas, Customers, searchTerm, statusFilter, sortOption]);


    const fetchGiftDataref = async () => {
        // try {
        //     setGiftCardDatas([]);
        //     const response = await fetch("http://localhost:5000/api/giftcard/");
        //     if (!response.ok) {
        //         throw new Error("Failed to fetch giftcard data");
        //     }
        //     const data = await response.json();
        //     const updatedData = data.map((item) => ({
        //         ...item,
        //         id: item._id,
        //     }));
        //     setGiftCardDatas(updatedData);
        // } catch (err) {
        //     setError(err.message);
        // }
    };

    useEffect(() => {
        fetchGiftDataref();
    }, []);
    const openDeleteModal = (id) => {
        setPendingDeleteId(id);
        setShowDeleteModal(true);
    };
    const confirmDelete = async () => {
        const id = pendingDeleteId;
        if (!id) return;

        // 🔴 call your API or just filter the local array
        setGiftCardDatas(prev => prev.filter(card => card.id !== id));

        setShowDeleteModal(false);
        setPendingDeleteId(null);
    };
    const handleShow = () => setShowModal(true);
    return (
        <div className="fn-conatiner">
            <div className="d-flex bd-highlight justify-content-between align-items-start ">
                <div className="p-3 mt-3 flex-grow-1 ">
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
                    <Button
                        variant="light"
                        aria-label="Refresh"
                        className="text-secondary"
                        onClick={fetchGiftDataref}
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
                        <Form.Group controlId="giftCard">
                            <Form.Label>
                                Warranty <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter warranty "
                                name="giftCard"
                                value={formData.warranty}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Row className="mt-3">
                            <Col>
                                <Form.Group controlId="issuedDate">
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
                                <Form.Group controlId="expiryDate">
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
                                <Form.Group controlId="amount">
                                    <Form.Label>
                                        Description <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="amount"
                                        // rows={1}
                                        value={formData.amount}
                                        onChange={handleChange}
                                    />

                                </Form.Group>
                            </Col>

                        </Row>

                        <Form.Group
                            controlId="status"
                            className="mt-4 d-flex align-items-center justify-content-between"
                        >
                            <Form.Label className=" me-3 mb-0">Status</Form.Label>
                            <Form.Check
                                type="switch"
                                name="status"
                                checked={formData.status}
                                onChange={handleChange}
                                className=""
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={handleClose}>
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
                                        placeholder="e.g. 2 years"
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
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Body className="text-center py-4">
                    {/* little red icon on top */}
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
                        <Button variant="warning" onClick={confirmDelete}>
                            Yes Delete
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            <div className="container-mn">
                <div className="d-flex justify-content-between align-items-center p-3 ">
                    <div>
                        {" "}
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
                        <select className="form-select" value={statusFilter} aria-label="Default select example" onChange={(e) => setStatusFilter(e.target.value)}>
                            <option>Status</option>
                            <option value="all">Status</option>
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
                                {/* <th scope="col">Expiry Date</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Balance</th> */}
                                <th scope="col">Status</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>

                            {GiftCardData
                                // .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                                .map((item, idx) => (
                                    <tr key={idx}>
                                        <th scope="col">
                                            <input type="checkbox" />
                                        </th>
                                        <td>{item.warranty}</td>
                                        {/* <td>{getCustomerName(item.customer)}</td> */}
                                        <td>{item.description}</td>
                                        {/* <td>{dayjs(item.issuedDate).format("YYYY-MM-DD")}</td>
                                        <td>{dayjs(item.expiryDate).format("YYYY-MM-DD")}</td> */}
                                        <td>{`${item.duration} ${item.period}`}</td>
                                        <td>
                                            <span
                                                className={`badge ${item.Status === "Active" ? "badge-success" : "badge-danger"
                                                    }`}
                                            >
                                                {/* {item.Status ? "Active" : "Inactive"} */}
                                                {item.Status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="iconsms">
                                                <button>
                                                    <IoEyeOutline />
                                                </button>
                                                <button
                                                    variant="warning text-white"
                                                    onClick={() => handleEditOpen(toEditForm(item))}
                                                >
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
                                    Math.min(prev + 1, Math.ceil(filteredGiftCards.length / rowsPerPage))
                                )
                            }
                            disabled={currentPage === Math.ceil(filteredGiftCards.length / rowsPerPage)}
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