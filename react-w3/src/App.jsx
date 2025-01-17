import { useEffect, useRef, useState } from "react";
import * as bootstrap from "bootstrap";

import "./assets/main.scss";

const api = "https://api.unsplash.com/search/photos/";
const key = "PUMq81VGh-BRvfEewL4nPwFSscMqdN0ylGGnxUZN3ok";

const App = () => {
	return (
		<>
			<div className="container">
				<div className="mb-3">
					<label htmlFor="searchInput" className="form-label">
						Insert Text
					</label>
					<input type="email" className="form-control" id="searchInput" placeholder="Keywords Input"></input>
				</div>
			</div>
		</>
	);
};

export default App;
