const handleProductSubmit = async (productData) => {
    try {
        // 调整数据格式以匹配API要求
        const apiProductData = {
            name: productData.name,
            category: productData.category,
            description: productData.description || '暂无描述', // 确保description有值
            mainImage: productData.image || '/api/placeholder/400/300', // 映射image到mainImage并提供默认值
            price: productData.price,
            isPublished: productData.status === 'published',
            isFeatured: false
        };

        if (editingItem) {
            // 编辑现有产品（简化处理，实际应该调用更新API）
            setProducts(products.map(p => 
                p.id === editingItem.id ? { ...p, ...productData } : p
            ));
            addActivity('product', '编辑了产品', productData.name);
        } else {
            // 添加新产品到数据库
            const newProduct = await createProduct(apiProductData);
            
            setProducts([...products, newProduct]);
            addActivity('product', '添加了新产品', productData.name);
        }
        setShowProductModal(false);
        setEditingItem(null);
    } catch (error) {
        console.error('创建产品失败:', error);
        // 可以添加错误提示给用户
        alert('创建产品失败，请检查所有必填字段是否已填写');
    }
};
