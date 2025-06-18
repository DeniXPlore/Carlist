"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface Car {
  unique_id: number;
  mark_id: string;
  folder_id: string;
  price: number;
  images: { image: string[] } | null;
}

interface Meta {
  currentPage?: number;
  totalPages?: number;
  total?: number;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [meta, setMeta] = useState<Meta>({ currentPage: 1, totalPages: 1 });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    const page = searchParams.get("_page") || "1";
    const order = searchParams.get("_order") || null;
    setSortOrder(order as "asc" | "desc" | null);
    fetchCars(page, order);
  }, [searchParams]);

  const fetchCars = async (page: string, order: string | null) => {
    const url = `/api/cars?_limit=12&_page=${page}${
      order ? `&_sort=price&_order=${order}` : ""
    }`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Ошибка загрузки данных");
      const data = await response.json();
      console.log("Full API Response:", JSON.stringify(data, null, 2));
      const limitedCars = data.data
        .slice(0, 12)
        .map((car: Car, index: number) => ({
          unique_id: car.unique_id || index,
          mark_id: car.mark_id,
          folder_id: car.folder_id,
          price: car.price,
          images: car.images || {
            image: ["https://via.placeholder.com/320x160"],
          },
        }));
      console.log("Processed Cars:", limitedCars);
      const totalPages =
        data.meta?.totalPages ||
        (data.meta?.total
          ? Math.ceil(data.meta.total / 12)
          : Math.ceil(1897 / 12));
      const currentPage = data.meta?.currentPage || parseInt(page);
      setCars(limitedCars);
      setMeta({ currentPage, totalPages });
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleSort = (order: "asc" | "desc" | null) => {
    const params = new URLSearchParams(searchParams);
    if (order) {
      params.set("_order", order);
    } else {
      params.delete("_order");
    }
    const currentPage = meta.currentPage?.toString() || "1";
    params.set("_page", currentPage);
    router.push(`/?${params.toString()}`);
    fetchCars(currentPage, order);
  };

  const handlePageChange = (page: number) => {
    let newPage = page;
    if (page < 1 && meta.currentPage === 1) {
      newPage = meta.totalPages || 1;
    }
    if (page > (meta.totalPages || 1) && meta.currentPage === meta.totalPages) {
      newPage = 1;
    }
    if (newPage >= 1 && newPage <= (meta.totalPages || 1)) {
      const params = new URLSearchParams(searchParams);
      params.set("_page", newPage.toString());
      router.push(`/?${params.toString()}`);
      fetchCars(newPage.toString(), searchParams.get("_order") || null);
    }
  };

  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
        <div className="mb-6">
          <select
            onChange={(e) => handleSort(e.target.value as "asc" | "desc" | null)}
            value={sortOrder || ""}
            className="p-2 border border-gray-700 rounded bg-gray-800 text-white"
          >
            <option value="">No sorting</option>
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cars.map((car) => (
            <div
              key={`${meta.currentPage}-${car.unique_id}`}
              className="rounded-lg bg-white text-black shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="w-full flex rounded-t overflow-hidden">
                <Image
                  src={
                    car.images?.image && car.images.image.length > 0
                      ? car.images.image[0]
                      : "https://via.placeholder.com/320x160"
                  }
                  alt={`${car.mark_id} ${car.folder_id}`}               
                  className="w-full h-auto object-cover"
                  width={320}
                  height={160}
                  priority={meta.currentPage === 1 && cars.indexOf(car) < 3}
                  loading={
                    meta.currentPage === 1 && cars.indexOf(car) < 3
                      ? undefined
                      : "lazy"
                  }
                  onError={(e) => {
                    console.log(
                      "Image Load Error for:",
                      car.images?.image?.[0] || "default",
                      e
                    );
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="bg-[rgb(50_41_7)] p-2 rounded-b">
                <h3 className="text-lg text-white font-bold pb-2">{`${car.mark_id} ${car.folder_id}`}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-white bg-red-700 px-2 py-1 rounded">
                    ${car.price}
                  </p>
                  <button className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    КУПИТЬ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center items-center">
          <button
            onClick={() => handlePageChange(meta.currentPage! - 1)}
            disabled={meta.currentPage === 1 && meta.totalPages === 1}
            className="p-2 bg-gray-700 rounded-l text-white disabled:opacity-50 hover:bg-orange-600 transition-colors"
          >
            ←
          </button>
          <span className="mx-4 text-gray-300">
            Страница {meta.currentPage} из {meta.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(meta.currentPage! + 1)}
            disabled={
              meta.currentPage === meta.totalPages && meta.totalPages === 1
            }
            className="p-2 bg-gray-700 rounded-r text-white disabled:opacity-50 hover:bg-orange-600 transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </Suspense>
  );
}