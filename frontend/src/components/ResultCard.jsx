export default function ResultCard({

  item,

  showDelete,

  onDelete,

}) {

  return (

    <div
      className="
        bg-slate-800
        rounded-2xl
        overflow-hidden
        border
        border-slate-700
        shadow-lg
      "
    >

      {item.photo_url && (

        <img
          src={`http://localhost:5000${item.photo_url}`}

          alt={item.athlete_name}

          className="
            w-full
            h-60
            object-cover
          "
        />

      )}

      <div className="p-6">

        <h2
          className="
            text-2xl
            font-bold
            text-yellow-400
            mb-4
          "
        >
          {item.athlete_name}
        </h2>

        <div className="space-y-2">

          <p>
            Event:
            {" "}
            {item.event_name}
          </p>

          <p>
            Position:
            {" "}
            {item.position}
          </p>

          <p>
            Performance:
            {" "}
            {item.performance}
          </p>

        </div>

        {item.isBest && (

          <p
            className="
              mt-4
              text-green-400
              font-bold
            "
          >
            Best Athlete
          </p>

        )}

        {showDelete && (

          <button

            onClick={() =>
              onDelete(item.id)
            }

            className="
              mt-5
              bg-red-600
              hover:bg-red-700
              px-4
              py-2
              rounded-lg
            "
          >
            Delete
          </button>

        )}

      </div>

    </div>
  );
}