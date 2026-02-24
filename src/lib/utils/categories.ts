import type { CategoryNode } from '../types/product';

export function buildCategoryTree(categories: Array<{ data: { slug: string; name: string; parentCategory?: string; description: string; displayOrder: number; featured: boolean } }>): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Create nodes
  for (const cat of categories) {
    map.set(cat.data.slug, {
      ...cat.data,
      children: [],
    });
  }

  // Build tree
  for (const cat of categories) {
    const node = map.get(cat.data.slug)!;
    if (cat.data.parentCategory && map.has(cat.data.parentCategory)) {
      map.get(cat.data.parentCategory)!.children.push(node);
    } else if (!cat.data.parentCategory) {
      roots.push(node);
    }
  }

  // Sort by displayOrder
  const sortNodes = (nodes: CategoryNode[]): CategoryNode[] => {
    nodes.sort((a, b) => a.displayOrder - b.displayOrder);
    for (const node of nodes) {
      sortNodes(node.children);
    }
    return nodes;
  };

  return sortNodes(roots);
}

export function getCategoryBreadcrumbs(
  categorySlug: string,
  categories: Array<{ data: { slug: string; name: string; parentCategory?: string } }>,
): Array<{ label: string; href: string }> {
  const breadcrumbs: Array<{ label: string; href: string }> = [];
  const categoryMap = new Map(categories.map((c) => [c.data.slug, c.data]));

  let current = categoryMap.get(categorySlug);
  while (current) {
    breadcrumbs.unshift({
      label: current.name,
      href: `/products/${current.slug}`,
    });
    current = current.parentCategory ? categoryMap.get(current.parentCategory) : undefined;
  }

  return breadcrumbs;
}
