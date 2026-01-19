const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
        const productData = {
            name: newProduct.name,
            category: newProduct.category,
            description: newProduct.description || '暂无描述', // 确保description有值
            mainImage: newProduct.mainImage || '/api/placeholder/400/300', // 确保mainImage有值
            price: parseFloat(newProduct.price) || null,
            isPublished: true
        };
        
        const addedProduct = await createProduct(productData);
        setProducts(prev => [...prev, addedProduct]);
        setNewProduct({
            name: '',
            category: 'CNC Machines',
            description: '',
            price: '',
            mainImage: ''
        });
        setShowAddForm(false);
    } catch (error) {
        console.error('添加产品失败:', error);
        // 可以添加错误提示给用户
        alert('添加产品失败，请检查所有必填字段是否已填写');
    }
};
