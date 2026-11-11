import { useState } from "react";
import { FolderTree, Plus } from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CategoryFormDialog from "../components/categories/CategoryFormDialog";
import CategoryTree from "../components/categories/CategoryTree";
import DeletedCategoriesPanel from "../components/categories/DeletedCategoriesPanel";
import { useCategoryTree } from "../hooks/useCategoryTree";

const CategoriesPage = () => {
  const { tree, deleted } = useCategoryTree();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías y Tipos"
        icon={FolderTree}
        description="Jerarquía de dos niveles para clasificar los activos. Los equipos siempre se asignan a una subcategoría."
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="font-semibold shadow-[0_0_8px_hsl(var(--sigap-sky)/0.4)] transition-shadow hover:shadow-[0_0_14px_hsl(var(--sigap-sky)/0.55)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        }
      />

      <Tabs defaultValue="tree">
        <TabsList>
          <TabsTrigger value="tree">Jerarquía</TabsTrigger>
          <TabsTrigger value="deleted">Eliminadas ({deleted.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-4">
          <CategoryTree tree={tree} />
        </TabsContent>

        <TabsContent value="deleted" className="mt-4">
          <DeletedCategoriesPanel deleted={deleted} />
        </TabsContent>
      </Tabs>

      <CategoryFormDialog open={createOpen} onOpenChange={setCreateOpen} parent={null} />
    </div>
  );
};

export default CategoriesPage;
