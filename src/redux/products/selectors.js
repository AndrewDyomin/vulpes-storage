export const selectAllProducts = state => state.products.items;
export const selectActiveProduct = state => state.products.activeItem;
export const selectProductsBarcodes = state => state.products.barcodes;
export const selectProductsLoading = state => state.products.isLoading;