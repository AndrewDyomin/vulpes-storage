import axios from "axios";
import { useState, useEffect } from "react";

export const ProductInfo = ({ id }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        async function getProduct() {
            const response = await axios.get(`/puig-api/product-by-id/${id}`)
            setProduct(response.data);
        }

        if (!product) {
            getProduct();
        }
        console.log(product)
    }, [id, product]);

    return (
        <>{id}</>
    )
}