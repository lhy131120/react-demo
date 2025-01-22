import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

import "./assets/main.scss";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultModalState = {
	imageUrl: "",
	title: "",
	category: "",
	unit: "",
	origin_price: "",
	price: "",
	description: "",
	content: "",
	is_enabled: 0,
	imagesUrl: [],
};

const App = () => {
	const [isAuth, setIsAuth] = useState(false);
	const [products, setProducts] = useState([]);
	const [tempProduct, setTempProduct] = useState(defaultModalState);
	const [modalMode, setModalMode] = useState(null);
	const [userInfo, setUserInfo] = useState({
		username: "",
		password: "",
	});
	const productModalRef = useRef(null);
	const delProductModalRef = useRef(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUserInfo({
			...userInfo,
			[name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post(`${API_BASE}/admin/signin`, userInfo);
			const { token, expired } = res.data;
			document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
			axios.defaults.headers.common["Authorization"] = token;

			getProducts();
			setIsAuth(true);
		} catch (error) {
			console.error(error.response.data.message);
		}
	};

	// const getProducts = async () => {
	// 	const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
	// 	setProducts(res.data.products);
	// };

  const getProducts = async () => {
		try {
			const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
			const fetchedProducts = res.data.products;
			setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
		} catch (error) {
			console.error("Error fetching products:", error);
			setProducts([]);
		}
	};

	const checkUserLogin = async () => {
		const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, "$1");

		if (!token) {
			setIsAuth(false);
			return;
		}

		axios.defaults.headers.common["Authorization"] = token;

		try {
			await axios.post(`${API_BASE}/api/user/check`);
			getProducts();
			setIsAuth(true);
		} catch (error) {
			console.error(error.response.data.message);
			setIsAuth(false);
		}
	};

	const handleOpenModal = (modalMode, product) => {
		setModalMode(modalMode);

		// if (modalMode === "new") {
		// 	setTempProduct(defaultModalState);
		// } else {
		// 	// 先把在網站新增的空圖片陣列清除
		// 	if (product?.imagesUrl) {
		// 		const filterArr = product.imagesUrl?.filter((item) => item != "");
		// 		setTempProduct({
		// 			...product,
		// 			imagesUrl: filterArr,
		// 		});
		// 	} else {
		// 		setTempProduct({
		// 			...product,
		// 			imagesUrl: [],
		// 		});
		// 	}
		// }
		if (modalMode === "new") {
			setTempProduct(defaultModalState);
		} else if (product) {
			setTempProduct({
				...product,
				imagesUrl: Array.isArray(product.imagesUrl) ? product.imagesUrl?.filter((item) => item !== "") : [],
			});
		} else {
			setTempProduct(defaultModalState);
		}
		// modalMode === "new" ? setTempProduct(defaultModalState) : setTempProduct(product);
		const modal = Modal.getInstance(productModalRef.current);
		modal.show();
	};

	const handleCloseModal = () => {
		const modal = Modal.getInstance(productModalRef.current);
		modal.hide();
	};

	const handleOpenDeleteModal = (product) => {
		if (!product) {
			console.error("Invalid product passed to handleOpenDeleteModal");
			return;
		}
		setTempProduct(product);
		const modal = Modal.getInstance(delProductModalRef.current);
		modal.show();
	};

	const handleCloseDeleteModal = () => {
		const modal = Modal.getInstance(delProductModalRef.current);
		modal.hide();
	};

	const handleModalInputChange = (e) => {
		const { name, value, checked, type } = e.target;
		setTempProduct({
			...tempProduct,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleImageChange = (e, index) => {
		const { value } = e.target;
		// console.log(value, index);
		const newImages = [...tempProduct.imagesUrl];
		newImages[index] = value;
		setTempProduct({
			...tempProduct,
			imagesUrl: newImages,
		});
	};

	const handleAddImage = () => {
		const newImage = [...tempProduct.imagesUrl, ""];
		setTempProduct({
			...tempProduct,
			imagesUrl: newImage,
		});
	};

	const handleRemoveImage = () => {
		const newImages = [...tempProduct.imagesUrl];
		newImages.pop();
		setTempProduct({
			...tempProduct,
			imagesUrl: newImages,
		});
	};

	const createProduct = async () => {
		try {
			await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, {
				data: {
					...tempProduct,
					origin_price: Number(tempProduct.origin_price),
					price: Number(tempProduct.price),
					is_enabled: tempProduct.is_enabled ? 1 : 0,
				},
			});
		} catch (error) {
			console.error(error.response.data.message);
		}
	};

	const updateProduct = async () => {
		try {
			await axios.put(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, {
				data: {
					...tempProduct,
					origin_price: Number(tempProduct.origin_price),
					price: Number(tempProduct.price),
					is_enabled: tempProduct.is_enabled ? 1 : 0,
				},
			});
		} catch (error) {
			console.log(`更新產品失敗: ${error.response.data.message}`);
		}
	};

	const deleteProduct = async () => {
		try {
			await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, {
				data: {
					...tempProduct,
					origin_price: Number(tempProduct.origin_price),
					price: Number(tempProduct.price),
					is_enabled: tempProduct.is_enabled ? 1 : 0,
				},
			});
		} catch (error) {
			console.log(`刪除產品失敗: ${error.response.data.message}`);
		}
	};

	const handleUpdateProduct = async () => {
		const apiCall = modalMode === "new" ? createProduct : updateProduct;

		try {
			await apiCall();
			getProducts();
			handleCloseModal();
		} catch (error) {
			console.log(`Error: ${error.response.data.message}`);
		}
	};

	const handleDeleteProduct = async () => {
		try {
			await deleteProduct();
			getProducts();
			handleCloseDeleteModal();
		} catch (error) {
			console.log(`Error: ${error.response.data.message}`);
		}
	};

	useEffect(() => {
		if (!Array.isArray(products)) {
			setProducts([]);
		}
	}, [products]);

	useEffect(() => {
		checkUserLogin();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		new Modal(productModalRef.current, {
			backdrop: false,
		});
		new Modal(delProductModalRef.current, {
			backdrop: false,
		});
	}, []);

	return (
		<>
			{isAuth ? (
				<div className="container py-5">
					<div className="row">
						<div className="col">
							<div className="d-flex justify-content-between mb-3">
								<h2>產品列表</h2>
								<button
									type="button"
									className="btn btn-warning"
									onClick={() => {
										handleOpenModal("new");
									}}
								>
									新增產品
								</button>
							</div>
							<table className="table">
								<thead>
									<tr>
										<th scope="col">相片</th>
										<th scope="col">產品名稱</th>
										<th scope="col">原價</th>
										<th scope="col">售價</th>
										<th scope="col">是否啟用</th>
										<th scope="col"></th>
									</tr>
								</thead>
								<tbody>
									{(products || []).map((product) => (
										<tr key={product.id} style={{ verticalAlign: "middle" }}>
											<th scope="row">
												<img src={product.imageUrl} style={{ width: "70px", objectFit: "cover" }} alt="" />
											</th>
											<th>{product.title}</th>
											<td>{product.origin_price}</td>
											<td>{product.price}</td>
											<td>
												{product.is_enabled ? (
													<span className="text-success">啟用</span>
												) : (
													<span className="text-danger">未啟用</span>
												)}
											</td>
											<td>
												<div className="btn-group">
													<button
														type="button"
														className="btn btn-outline-primary btn-sm"
														onClick={() => handleOpenModal("edit", product)}
													>
														編輯
													</button>
													<button
														onClick={() => handleOpenDeleteModal(product)}
														type="button"
														className="btn btn-outline-danger btn-sm"
													>
														刪除
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			) : (
				<div className="container">
					<div className="row justify-content-center">
						<div className="col-8">
							<form id="form" className="loginForm" onSubmit={handleSubmit}>
								<div className="form-floating mb-3">
									<input
										type="email"
										className="form-control"
										id="mail"
										name="username"
										placeholder="name@example.com"
										onChange={handleInputChange}
									/>
									<label htmlFor="mail">Email address</label>
								</div>
								<div className="form-floating mb-3">
									<input
										type="password"
										className="form-control"
										id="password"
										name="password"
										placeholder="Password"
										onChange={handleInputChange}
									/>
									<label htmlFor="password">Password</label>
								</div>
								<button className="btn btn-warning mb-3 fw-bold " type="submit">
									Login
								</button>
							</form>
						</div>
					</div>
				</div>
			)}

			<div ref={productModalRef} className="modal fade" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
				<div className="modal-dialog modal-dialog-centered modal-xl">
					<div className="modal-content border-0 shadow">
						<div className="modal-header border-bottom">
							<h5 className="modal-title fs-4">{modalMode === "new" ? "新增產品" : "編輯產品"}</h5>
							<button
								type="button"
								className="btn-close"
								aria-label="Close"
								onClick={() => handleCloseModal()}
							></button>
						</div>

						<div className="modal-body p-4">
							<div className="row g-4">
								<div className="col-md-4">
									<div className="mb-4 text-start">
										<label htmlFor="primary-image" className="form-label">
											主圖
										</label>
										<div className="input-group">
											<input
												onChange={handleModalInputChange}
												defaultValue={tempProduct.imageUrl}
												name="imageUrl"
												type="text"
												id="primary-image"
												className="form-control"
												placeholder="請輸入圖片連結"
											/>
										</div>
										<img src={tempProduct.imageUrl} alt={tempProduct.title} className="img-fluid w-100" />
									</div>

									{/* 副圖 */}
									<div className="border border-2 border-dashed rounded-3 p-3 text-start mb-3">
										{(tempProduct.imagesUrl || []) // 篩選掉空字串的項目
											.map((image, index) => (
												<div key={index} className="mb-2">
													<img src={image} className="img-fluid mb-2" alt={`副圖${index + 1}`} />
													<input
														onChange={(e) => handleImageChange(e, index)}
														type="text"
														id={`imagesUrl-${index + 1}`}
														className="form-control mb-2"
														defaultValue={image}
														placeholder={`圖片網址 ${index + 1}`}
													/>
												</div>
											))}
										{/* Button Group */}
										<div className="btn-group w-100">
											{tempProduct.imagesUrl.length < 5 &&
												tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !== "" && (
													<button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">
														新增圖片
													</button>
												)}

											{tempProduct.imagesUrl.length >= 1 && (
												<button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">
													取消圖片
												</button>
											)}
										</div>
									</div>
								</div>
								<div className="col-md-8 text-start">
									<div className="mb-3">
										<label htmlFor="title" className="form-label">
											標題
										</label>
										<input
											value={tempProduct.title}
											onChange={handleModalInputChange}
											name="title"
											id="title"
											type="text"
											className="form-control"
											placeholder="請輸入標題"
										/>
									</div>

									<div className="mb-3">
										<label htmlFor="category" className="form-label">
											分類
										</label>
										<input
											value={tempProduct.category}
											onChange={handleModalInputChange}
											name="category"
											id="category"
											type="text"
											className="form-control"
											placeholder="請輸入分類"
										/>
									</div>

									<div className="mb-3">
										<label htmlFor="unit" className="form-label">
											單位
										</label>
										<input
											value={tempProduct.unit}
											onChange={handleModalInputChange}
											name="unit"
											id="unit"
											type="text"
											className="form-control"
											placeholder="請輸入單位"
										/>
									</div>

									<div className="row g-3 mb-3">
										<div className="col-6">
											<label htmlFor="origin_price" className="form-label">
												原價
											</label>
											<input
												value={tempProduct.origin_price}
												onChange={handleModalInputChange}
												name="origin_price"
												id="origin_price"
												type="number"
												className="form-control"
												placeholder="請輸入原價"
											/>
										</div>
										<div className="col-6">
											<label htmlFor="price" className="form-label">
												售價
											</label>
											<input
												value={tempProduct.price}
												onChange={handleModalInputChange}
												name="price"
												id="price"
												type="number"
												className="form-control"
												placeholder="請輸入售價"
											/>
										</div>
									</div>

									<div className="mb-3">
										<label htmlFor="description" className="form-label">
											產品描述
										</label>
										<textarea
											value={tempProduct.description}
											onChange={handleModalInputChange}
											name="description"
											id="description"
											className="form-control"
											rows={4}
											placeholder="請輸入產品描述"
										></textarea>
									</div>

									<div className="mb-3">
										<label htmlFor="content" className="form-label">
											說明內容
										</label>
										<textarea
											value={tempProduct.content}
											onChange={handleModalInputChange}
											name="content"
											id="content"
											className="form-control"
											rows={4}
											placeholder="請輸入說明內容"
										></textarea>
									</div>

									<div className="form-check">
										<input
											checked={tempProduct.is_enabled}
											onChange={handleModalInputChange}
											name="is_enabled"
											type="checkbox"
											className="form-check-input"
											id="isEnabled"
										/>
										<label className="form-check-label" htmlFor="isEnabled">
											是否啟用
										</label>
									</div>
								</div>
							</div>
						</div>

						<div className="modal-footer border-top bg-light">
							<button type="button" className="btn btn-secondary" onClick={() => handleCloseModal()}>
								取消
							</button>
							<button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
								確認
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Delete Modal */}
			<div
				ref={delProductModalRef}
				className="modal fade"
				id="delProductModal"
				tabIndex="-1"
				style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
			>
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5">刪除產品</h1>
							<button onClick={handleCloseDeleteModal} type="button" className="btn-close" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							你是否要刪除
							<span className="text-danger fw-bold">{tempProduct.title}</span>
						</div>
						<div className="modal-footer">
							<button onClick={handleCloseDeleteModal} type="button" className="btn btn-secondary">
								取消
							</button>
							<button onClick={handleDeleteProduct} type="button" className="btn btn-danger">
								刪除
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default App;
