export default function StoryBuilderPage() {
  return (
    <div className="story-builder p-8">
      <h1 className="text-3xl font-bold mb-6">Story Authoring CMS</h1>
      <p className="text-gray-600 mb-8">
        Create and manage interactive stories for learners.
      </p>

      <div className="builder-actions space-y-4">
        <button className="btn-primary w-full p-4 text-left">
          <h2 className="text-xl font-semibold">New Story</h2>
          <p className="text-gray-600">Create a new interactive story</p>
        </button>

        <button className="btn-secondary w-full p-4 text-left">
          <h2 className="text-xl font-semibold">Draft Stories</h2>
          <p className="text-gray-600">Continue working on drafts</p>
        </button>

        <button className="btn-secondary w-full p-4 text-left">
          <h2 className="text-xl font-semibold">Published Stories</h2>
          <p className="text-gray-600">Manage published stories</p>
        </button>
      </div>
    </div>
  );
}
