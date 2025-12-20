'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteVendorListing } from '@/actions/vendor-actions';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  quantity: number;
  imageUrl: string;
  status: string;
  createdAt: Date;
  entity?: {
    name: string;
  } | null;
  category?: {
    name: string;
  } | null;
}

interface ProductsTableProps {
  products: Product[];
  onDelete?: () => void;
}

export function ProductsTable({ products, onDelete }: ProductsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    const result = await deleteVendorListing(selectedProduct.id);

    if (result.success) {
      toast.success(result.message || 'Product archived successfully');
      setDeleteDialogOpen(false);
      onDelete?.();
    } else {
      toast.error(result.error || 'Failed to archive product');
    }
    setIsDeleting(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 border-green-500/20',
      draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      sold: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      archived: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };

    return (
      <Badge className={variants[status] || variants.draft} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
            No products found. Create your first product to get started.
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {product.category && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] sm:text-[10px] py-0 px-1.5 h-4 bg-primary/10 text-primary"
                          >
                            {product.category.name}
                          </Badge>
                        )}
                        {getStatusBadge(product.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-primary font-bold text-sm sm:text-base">
                        Rs.{product.price}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Qty: {product.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/vendor/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-white hover:bg-destructive"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No products found. Create your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-foreground">{product.title}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.category && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-2 h-4 bg-primary/10 text-primary border-primary/20"
                          >
                            {product.category.name}
                          </Badge>
                        )}
                        {product.entity && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-2 h-4 border-muted-foreground/30 text-muted-foreground"
                          >
                            {product.entity.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {product.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">Rs.{product.price}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/vendor/products/${product.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent hover:bg-black/5 hover:text-black"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-white hover:bg-primary"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.title}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
