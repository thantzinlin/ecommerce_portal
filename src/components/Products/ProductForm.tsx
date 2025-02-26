"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { handleError, httpGet, httpPost, httpPut } from "@/utils/apiClient";
import toast from 'react-hot-toast';

interface ProductAttribute {
  name: string;
  values: string[];
}

interface ProductVariant {
  _id: string;
  attributeValues: { [key: string]: string };  // e.g., { "Size": "M", "Color": "Red" }
  sku: string;
  price: number;
  stockQuantity: number;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;  // base price
  categoryId: string;
  stockQuantity: number;  // total stock
  images: string[];
  attributes: ProductAttribute[];
  variants: ProductVariant[];
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  id: string | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ id }) => {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    stockQuantity: 0,
    images: [""],
    attributes: [],
    variants: [],
  });
  

  const [ProductVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [newAttribute, setNewAttribute] = useState({ name: "", values: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const generateSKU = (productName: string, attributeValues: { [key: string]: string }, categoryId: string) => {
    // 1. Category prefix (2 chars)
    const categoryPrefix = categoryId.substring(0, 2).toUpperCase();
    
    // 2. Product identifier (3 chars)
    const productIdentifier = productName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    
    // 3. Variant attributes
    const size = (attributeValues['Size'] || '').substring(0, 2).toUpperCase();
    const color = (attributeValues['Color'] || '').substring(0, 3).toUpperCase();
    
    // 4. Random unique identifier (4 digits)
    const uniqueId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // 5. Timestamp - last 2 digits of current timestamp
    const timestamp = Date.now().toString().slice(-2);
    
    const skuParts = [
      categoryPrefix,
      productIdentifier,
      size,
      color,
      uniqueId,
      timestamp
    ].filter(Boolean); 

    return skuParts.join('-');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
  
      try {
        const categoriesResponse = await httpGet("categories");
        setCategories(categoriesResponse.data.data);
  
        const productResponse = await httpGet(`products/${id}`);
        if (productResponse.data.returncode === "200") {
         setProduct(productResponse.data.data);
          

        } else {
          console.error("Failed to load product", productResponse.data.message);
          handleError(productResponse.data, router);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        handleError(err, router);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]); // Runs when `id` changes

  useEffect(() => {
    console.log("Updated product data:", product);
  }, [product]);
  

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert FileList to Array for easier manipulation
    const fileArray = Array.from(files);
    
    // Check if total images (existing + new) won't exceed 5
    if (product.images.length + fileArray.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const newImages: string[] = [];

    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(base64);
      }
    }

    setProduct(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAttributeAdd = () => {
    if (!newAttribute.name || !newAttribute.values) return;
    
    const values = newAttribute.values.split(",").map(v => v.trim());
    
    // Check if attribute already exists
    if (product.attributes.some(attr => attr.name.toLowerCase() === newAttribute.name.toLowerCase())) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Attribute",
        text: "This attribute already exists.",
      });
      return;
    }

    // Add new attribute
    const updatedAttributes = [...product.attributes, { name: newAttribute.name, values }];
    setProduct(prev => ({
      ...prev,
      attributes: updatedAttributes
    }));
    setNewAttribute({ name: "", values: "" });

    // Generate variants based on all attributes
    generateVariants(updatedAttributes);
  };

  const generateVariants = (attributes: ProductAttribute[]) => {
    if (attributes.length === 0) return;

    // Helper function to generate all possible combinations
    const cartesianProduct = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => 
          acc.flatMap(combo => curr.map(item => [...combo, item])),
        [[]]
      );
    };

    // Get all attribute values in arrays
    const attributeValues = attributes.map(attr => attr.values);
    
    // Generate all possible combinations
    const combinations = cartesianProduct(attributeValues);
    
    // Create variants from combinations
    const newVariants = combinations.map(combination => {
      // Create attribute value mapping
      const attributeValues = attributes.reduce((acc, attr, index) => ({
        ...acc,
        [attr.name]: combination[index]
      }), {} as { [key: string]: string });

      // Check if variant already exists
      const existingVariant = product.variants.find(v => 
        Object.entries(attributeValues).every(([key, value]) => 
          v.attributeValues[key] === value
        )
      );

      if (existingVariant) {
        return existingVariant;
      }

      // Create new variant
      return {
        _id: Math.random().toString(36).substr(2, 9),
        attributeValues,
        sku: generateSKU(product.name, attributeValues, product.categoryId),
        price: product.price,
        stockQuantity: 0
      };
    });

    setProduct(prev => ({
      ...prev,
      variants: newVariants
    }));
  };

  const removeAttribute = (attributeName: string) => {
    // Remove the attribute
    const updatedAttributes = product.attributes.filter(
      attr => attr.name !== attributeName
    );

    // If no attributes remain, clear all variants
    if (updatedAttributes.length === 0) {
      setProduct(prev => ({
        ...prev,
        attributes: [],
        variants: []
      }));
      return;
    }

    // Generate new variants with the updated attributes
    const cartesianProduct = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => 
          acc.flatMap(combo => curr.map(item => [...combo, item])),
        [[]]
      );
    };

    const attributeValues = updatedAttributes.map(attr => attr.values);
    const combinations = cartesianProduct(attributeValues);
    
    const newVariants = combinations.map(combination => {
      const variantAttributeValues = updatedAttributes.reduce((acc, attr, index) => ({
        ...acc,
        [attr.name]: combination[index]
      }), {} as { [key: string]: string });

      return {
        _id: Math.random().toString(36).substr(2, 9),
        attributeValues: variantAttributeValues,
        sku: generateSKU(product.name, variantAttributeValues, product.categoryId),
        price: product.price,
        stockQuantity: 0
      };
    });

    setProduct(prev => ({
      ...prev,
      attributes: updatedAttributes,
      variants: newVariants
    }));
  };

  const handleVariantChange = (variantId: string, field: keyof Omit<ProductVariant, '_id' | 'attributeValues'>, value: string | number) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.map(variant => 
        variant._id === variantId
          ? { ...variant, [field]: value }
          : variant
      )
    }));
  };

  const removeVariant = (variantId: string) => {
    // Filter out the deleted variant and regenerate SKUs for remaining variants
    const updatedVariants = product.variants
      .filter(v => v._id !== variantId)
      .map(variant => ({
        ...variant,
        sku: generateSKU(product.name, variant.attributeValues, product.categoryId)
      }));

    setProduct(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!product.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!product.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!product.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!product.price || product.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!product.stockQuantity || product.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity must be 0 or greater';
    }

    // Validate variants if they exist
    if (product.variants.length > 0) {
      const variantErrors: string[] = [];
      product.variants.forEach((variant, index) => {
        if (!variant.price || variant.price < 0) {
          variantErrors.push(`Variant ${index + 1}: Price adjustment is required`);
        }
        if (variant.stockQuantity < 0) {
          variantErrors.push(`Variant ${index + 1}: Stock quantity must be 0 or greater`);
        }
      });
      if (variantErrors.length > 0) {
        newErrors.variants = variantErrors.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show error message
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      // Transform variants to match the desired format
      const transformedVariants = product.variants.map(variant => ({
        size: variant.attributeValues['Size'] || '',
        color: variant.attributeValues['Color'] || '',
        sku: generateSKU(product.name, variant.attributeValues, product.categoryId),
        price: Number(product.price) + Number(variant.price), // Base price + variant price adjustment
        stockQuantity: Math.max(0, Number(variant.stockQuantity)), // Ensure non-negative stock
        images: [] // TODO: Add variant-specific images if available
      }));

      const formData = {
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        price: Number(product.price),
        stockQuantity: Number(product.stockQuantity),
        images: product.images,
        variants: transformedVariants
      };

      let res: any = {};
      if (id) {
        res = await httpPut(`products/${id}`, formData);
      } else {
        res = await httpPost("products", formData);
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: id ? "Product updated successfully!" : "Product created successfully!",
      });

      router.push("/products");
    } catch (error: any) {
      console.error("Error submitting product:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
          Loading...
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h4 className="mb-6 text-center text-2xl font-semibold">
        {id ? "Update Product" : "New Product"}
      </h4>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Product Information */}
            <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the main product details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Product Name */}
                <div className="flex items-center gap-4">
                  <label className="w-1/4 text-sm font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className="w-3/4">
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      required
                      className={`w-full rounded-lg border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-center gap-4">
                  <label className="w-1/4 text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="w-3/4">
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className={`w-full rounded-lg border ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Base Price */}
                <div className="flex items-center gap-4">
                  <label className="w-1/4 text-sm font-medium text-gray-700">Base Price <span className="text-red-500">*</span></label>
                  <div className="w-3/4 relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      name="price"
                      value={product.price}
                      onChange={(e) => {
                        const value = Math.max(0, Number(e.target.value));
                        setProduct({ ...product, price: value });
                      }}
                      onKeyDown={preventNegativeInput}
                      required
                      className={`w-full rounded-lg border ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      } pl-8 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-4">
                  <label className="w-1/4 text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                  <div className="w-3/4">
                    <select
                      name="categoryId"
                      value={product.categoryId}
                      onChange={handleChange}
                      required
                      className={`w-full rounded-lg border ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
                    )}
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="flex items-center gap-4">
                  <label className="w-1/4 text-sm font-medium text-gray-700">Stock Quantity <span className="text-red-500">*</span></label>
                  <div className="w-3/4">
                    <input
                      type="number"
                      min="0"
                      name="stockQuantity"
                      value={product.stockQuantity}
                      onChange={(e) => {
                        const value = Math.max(0, Number(e.target.value));
                        setProduct({ ...product, stockQuantity: value });
                      }}
                      onKeyDown={preventNegativeInput}
                      required
                      className={`w-full rounded-lg border ${
                        errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    />
                    {errors.stockQuantity && (
                      <p className="mt-1 text-sm text-red-500">{errors.stockQuantity}</p>
                    )}
                  </div>
                </div>

                {/* Upload Image */}
                <div className="flex items-start gap-4">
                  <label className="w-1/4 text-sm font-medium text-gray-700 pt-2">Upload Images</label>
                  <div className="w-3/4 space-y-4">
                    <div className="flex items-center">
                      <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                        <div className="flex flex-col items-center space-y-2">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-sm text-gray-500">
                            Click to upload images (max 5)
                          </span>
                          <span className="text-xs text-gray-400">
                            {product.images.length}/5 images uploaded
                          </span>
                        </div>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          multiple
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {/* Image Preview Grid */}
                    {product.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {product.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="h-32 w-full object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="text-white hover:text-red-400 transition-colors duration-200"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            {index === 0 && (
                              <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Main Image
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Attributes */}
            <div className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Product Attributes</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add attributes like Size, Color, Weight, etc.
                  </p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {product.attributes.length} Attributes Added
                </div>
              </div>
              
              {/* Add New Attribute */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="font-medium text-gray-700 mb-2">Quick Guide:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>For sizes: enter "Size" as name and "S,M,L" as values</li>
                      <li>For weights: enter "Weight" as name and "100g,250g,500g" as values</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/3 relative group">
                    <input
                      type="text"
                      placeholder="Attribute Name (e.g., Size, Weight)"
                      value={newAttribute.name}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-1/2 relative group">
                    <input
                      type="text"
                      placeholder="Values (comma-separated: S,M,L or 100g,250g)"
                      value={newAttribute.values}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, values: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div 
                    className="relative"
                    title={!product.name || !product.categoryId ? "Please enter product name and select category first" : ""}
                  >
                    <button
                      type="button"
                      onClick={handleAttributeAdd}
                      disabled={!product.name || !product.categoryId}
                      className={`w-32 rounded-lg px-4 py-3 text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center justify-center gap-2 font-medium ${
                        !product.name || !product.categoryId
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Add Options:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewAttribute({ name: "Size", values: "S,M,L" });
                    }}
                    className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                    </svg>
                    Add Sizes (S,M,L)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewAttribute({ name: "Color", values: "Black,White,Gray" });
                    }}
                    className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Add Colors
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewAttribute({ name: "Weight", values: "100g,250g,500g" });
                    }}
                    className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    Add Weights (g)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewAttribute({ name: "Weight", values: "1kg,2kg,5kg" });
                    }}
                    className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    Add Weights (kg)
                  </button>
                </div>
              </div>

              {/* Existing Attributes */}
              <div className="space-y-3">
                {product.attributes.map((attr) => (
                  <div 
                    key={attr.name} 
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{attr.name}: </span>
                        <span className="text-gray-600">{attr.values.join(", ")}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(attr.name)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Variants Table */}
            {product.variants.length > 0 && (
              <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Product Variants</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage pricing and stock for each variant
                    </p>
                  </div>
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    {product.variants.length} Variants Generated
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {product.attributes.map(attr => (
                          <th key={attr.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {attr.name}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price Adjustment <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.variants.map((variant) => (
                        <tr key={variant._id} className="hover:bg-gray-50 transition-colors duration-200">
                          {product.attributes.map(attr => (
                            <td key={attr.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {variant.attributeValues[attr.name]}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {variant.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                value={variant.price}
                                onChange={(e) => handleVariantChange(variant._id, "price", parseFloat(e.target.value))}
                                onKeyDown={preventNegativeInput}
                                className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={variant.stockQuantity}
                              onChange={(e) => handleVariantChange(variant._id, "stockQuantity", parseInt(e.target.value))}
                              onKeyDown={preventNegativeInput}
                              className="w-full rounded-lg border border-gray-300 px-3 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => removeVariant(variant._id)}
                              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Show variant errors if any */}
            {errors.variants && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-500">{errors.variants}</p>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              className="mx-auto block w-1/4 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
