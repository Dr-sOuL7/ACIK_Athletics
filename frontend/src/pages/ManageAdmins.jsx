import { useEffect, useState } from "react";

import API from "../api/axios";

export default function ManageAdmins() {

  const [users, setUsers] =
    useState([]);

  async function fetchUsers() {

    try {

      const res =
        await API.get(
          "/results/users"
        );

      setUsers(res.data);

    } catch (err) {

      console.log(err);
    }
  }

 useEffect(() => {

  async function loadUsers() {

    try {

      const res =
        await API.get(
          "/results/users"
        );

      setUsers(res.data);

    } catch (err) {

      console.log(err);
    }
  }

  loadUsers();

}, []);

  async function makeAdmin(id) {

    try {

      await API.put(
        `/results/make-admin/${id}`
      );

      fetchUsers();

    } catch (err) {

      console.log(err);
    }
  }

  async function removeAdmin(id) {

    try {

      await API.put(
        `/results/remove-admin/${id}`
      );

      fetchUsers();

    } catch (err) {

      console.log(err);
    }
  }

  return (

    <div>

      <h1
        className="
          text-4xl
          mb-8
          text-yellow-400
        "
      >
        Manage Admins
      </h1>

      <div className="space-y-4">

        {users.map((user) => (

          <div
            key={user.id}

            className="
              bg-slate-800
              p-6
              rounded-xl
              flex
              justify-between
              items-center
            "
          >

            <div>

              <h2>
                {user.name}
              </h2>

              <p>
                {user.email}
              </p>

              <p>
                Role:
                {" "}
                {user.role}
              </p>

            </div>

            <div className="flex gap-3">

              {user.role !==
                "admin" && (

                <button

                  onClick={() =>
                    makeAdmin(user.id)
                  }

                  className="
                    bg-green-600
                    px-4
                    py-2
                    rounded-lg
                  "
                >
                  Make Admin
                </button>

              )}

              {user.role ===
                "admin" && (

                <button

                  onClick={() =>
                    removeAdmin(user.id)
                  }

                  className="
                    bg-red-600
                    px-4
                    py-2
                    rounded-lg
                  "
                >
                  Remove Admin
                </button>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}