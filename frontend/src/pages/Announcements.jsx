import { useEffect, useState } from "react";

import API from "../api/axios";

export default function Announcements() {

  const [announcements,
    setAnnouncements] =
    useState([]);

  useEffect(() => {

    async function fetchData() {

      try {

        const res =
          await API.get(
            "/results/announcements"
          );

        setAnnouncements(
          res.data
        );

      } catch (err) {

        console.log(err);
      }
    }

    fetchData();

  }, []);

  return (

    <div>

      <h1
        className="
          text-5xl
          text-yellow-400
          mb-8
        "
      >
        Announcements
      </h1>

      <div className="space-y-6">

        {announcements.map((item) => (

          <div
            key={item.id}

            className="
              bg-slate-800
              p-6
              rounded-2xl
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                mb-4
              "
            >
              {item.title}
            </h2>

            <p>
              {item.message}
            </p>

            <p
              className="
                text-slate-400
                mt-4
              "
            >
              {new Date(
                item.created_at
              ).toLocaleString()}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}