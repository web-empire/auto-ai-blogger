import React from 'react';

const Skeleton = () => {
    return (
        <table className="w-full divide-y divide-gray-300">
            <thead className="bg-gray-50 header-nav">
                <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Write Post
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
                {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse even:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-600 sm:pl-6">
                            <div className="h-4 bg-gray-300 rounded w-48"></div>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Skeleton;