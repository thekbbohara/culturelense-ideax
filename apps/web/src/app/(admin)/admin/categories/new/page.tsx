import { CategoryForm } from '@/components/admin/category-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCategoryPage() {
  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>
        <h1 className="text-2xl font-bold">Add New Category</h1>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <CategoryForm />
      </div>
    </div>
  );
}
