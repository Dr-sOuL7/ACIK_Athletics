import { useEffect, useState }
from "react";

import API from "../api/axios";

export default function Home() {

  const [content, setContent] =
    useState(null);

  const [announcements,
    setAnnouncements] =
    useState([]);

  useEffect(() => {

    async function fetchData() {

      try {

        const homepageRes =
          await API.get(
            "/results/homepage"
          );

        setContent(
          homepageRes.data
        );

        const announcementRes =
          await API.get(
            "/results/announcements"
          );

        setAnnouncements(
          announcementRes.data.slice(0, 3)
        );

      } catch (err) {

        console.log(err);
      }
    }

    fetchData();

  }, []);

  if (!content) {

    return (
      <div className="p-10">
        Loading homepage...
      </div>
    );
  }

  return (

    <div className="p-10 space-y-10">

      {/* HOMEPAGE HEADER */}

      <div>

        <h1
          className="
            text-5xl
            font-bold
            text-yellow-400
            mb-4
          "
        >
          {content.title}
        </h1>

        <p
          className="
            text-2xl
            text-slate-300
          "
        >
          {content.subtitle}
        </p>

      </div>

      {/* MAIN ANNOUNCEMENT */}

      <div
        className="
          bg-slate-800
          p-6
          rounded-2xl
        "
      >

        <h2
          className="
            text-3xl
            font-bold
            mb-4
          "
        >
          Main Announcement
        </h2>

        <p className="text-lg">

          {content.announcement}

        </p>

      </div>

      {/* LATEST ANNOUNCEMENTS */}

      <div>

        <h2
          className="
            text-4xl
            text-yellow-400
            mb-6
          "
        >
          Latest Updates
        </h2>

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

              <h3
                className="
                  text-2xl
                  font-bold
                  mb-3
                "
              >
                {item.title}
              </h3>

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

    </div>
  );
}