import {api} from "~/utils/api";

export default function Today() {
  const {data} = api.email.today.useQuery()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-5xl font-bold" suppressHydrationWarning>
        Today&quot;s ({new Date().toLocaleDateString()}) TLDR newsletters
      </h1>

      {data?.map((entry) => (
        <div key={entry.title}
             className={`flex flex-col items-center justify-center gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20`}>
          <h2 className="text-2xl font-bold">{entry.title}</h2>
          <div className="text-lg">{entry.description}</div>
          <a href={entry.link} target="_blank" className="text-lg">
            visit article
          </a>
        </div>
      ))}
    </div>
  )
}