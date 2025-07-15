import React, { useState, useEffect } from 'react';

const ProductOrderStats = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      setLoading(true);
      // Try multiple possible base URLs
      const possibleURLs = [
        'http://localhost:3000',
        'https://your-api-domain.com', // Replace with your actual API domain
        '' // Empty string for same origin
      ];
      
      let response;
      let lastError;
      
      for (const baseURL of possibleURLs) {
        try {
          const url = baseURL ? `${baseURL}/api/orders/product-stats` : '/api/orders/product-stats';
          response = await fetch(url);
          if (response.ok) {
            break; // Success, exit loop
          }
        } catch (err) {
          lastError = err;
          continue; // Try next URL
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`HTTP error! status: ${response?.status || 'Network error'}`);
      }
      
      const data = await response.json();
      
      if (data.products) {
        setProducts(data.products);
        setError(null);
      } else {
        setError(data.message || 'No products data received');
      }
    } catch (err) {
      setError(`Error fetching product statistics: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchProductStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product Order Statistics</h2>
        <button
          onClick={fetchProductStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">📦</div>
          <p className="text-gray-600">No products found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Quantity Ordered
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product, index) => (
                <tr key={product.productId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex-shrink-0 h-16 w-16">
                      {product.productImage ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={product.productImage}
                          alt={product.productName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTI2IDI4QzI3LjEwNDYgMjggMjggMjcuMTA0NiAyOCAyNkMyOCAyNC44OTU0IDI3LjEwNDYgMjQgMjYgMjRDMjQuODk1NCAyNCAyNCAyNC44OTU0IDI0IDI2QzI0IDI3LjEwNDYgMjQuODk1NCAyOCAyNiAyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTIwIDM4TDI2IDMwTDMwIDM0TDM4IDI2TDQ0IDM4SDIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600 mr-2">
                        {product.totalQuantityOrdered}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((product.totalQuantityOrdered / Math.max(...products.map(p => p.totalQuantityOrdered))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductOrderStats;