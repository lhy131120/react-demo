/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
// import SearchBox from "./SearchBox";
import "./assets/main.scss";

const Card = ({ item }) => {
	return (
		<div className="card">
			<img src={item.urls.regular} className="card-img-top" height="400" width="100" style={{ objectFit: "cover" }} />
		</div>
	);
};

const SearchBox = ({ filterString, onSearchHandler }) => {
	return (
		<>
			<label htmlFor="filter" className="form-label">
				Search
			</label>
			<input
				type="text"
				className="form-control mb-3"
				id="filter"
				placeholder="insert keywords"
				defaultValue={filterString}
				onChange={onSearchHandler}
			/>
		</>
	);
};

function Ref() {
	const api = import.meta.env.VITE_UNSPLASH_API;
	const key = import.meta.env.VITE_UNSPLASH_KEY;

	const [filterString, setFilterString] = useState("animal");
	const [jsonData, setJsonData] = useState([]);
	const onSearchHandler = (e) => {
		setFilterString(e.target.value);
	};

	useEffect(() => {
		(async () => {
			try {
				const res = await axios.get(`${api}?client_id=${key}&query=${filterString}`);
				setJsonData(res.data);
			} catch (error) {
				console.log(error.message);
			}
		})();
	}, []);

	return (
		<>
			<div className="container">
				<SearchBox filterString={filterString} onSearchHandler={onSearchHandler} id="customId" />
				<div className="row row-cols-2 g-3">
					{jsonData.map((item) => {
						return (
							<div key={item.id} className="col">
								<Card item={item} />
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}

export default Ref;
