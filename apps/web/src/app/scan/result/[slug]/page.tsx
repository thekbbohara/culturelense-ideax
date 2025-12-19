import { getEntityBySlug } from '@/actions/entities';
import { Button } from '@culturelense/ui';

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { confidence: string };
}) {
  const result = await getEntityBySlug(params.slug);
  const entity = result.data;
  const confidence = parseFloat(searchParams.confidence) || 0;

  if (!entity) {
    return <div className="p-8 text-center text-white">Entity not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Hero Image */}
      <div className="h-64 w-full bg-gray-800 relative">
        {/* Placeholder for standard image */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          [Image of {entity.name}]
        </div>
      </div>

      <div className="p-6 -mt-6 bg-gray-900 rounded-t-3xl relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500">{entity.name}</h1>
            <p className="text-sm text-gray-400 uppercase tracking-widest">{entity.type}</p>
          </div>
          <div className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs font-mono">
            {Math.round(confidence * 100)}% MATCH
          </div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-8">
          {entity.description}
        </p>

        {entity.history && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2 text-yellow-500">Mythology</h3>
            <p className="text-gray-400 text-sm whitespace-pre-wrap">{entity.history}</p>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
          <Button className="w-full bg-yellow-600 text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition">
            Unlock Hidden Stories
          </Button>
        </div>
      </div>
    </div>
  );
}
