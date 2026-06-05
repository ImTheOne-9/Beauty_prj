import { Loader } from '@/shared/components/ui/Loader'
import { AdminAccessSection } from '../components/AdminAccessSection'
import { AdminApiKeysSection } from '../components/AdminApiKeysSection'
import { AdminCategoriesSection } from '../components/AdminCategoriesSection'
import { AdminOverviewSection } from '../components/AdminOverviewSection'
import { AdminPlansSection } from '../components/AdminPlansSection'
import { AdminProductsSection } from '../components/AdminProductsSection'
import { AdminProductVariantsSection } from '../components/AdminProductVariantsSection'
import { AdminRevenueSection } from '../components/AdminRevenueSection'
import { AdminScansSection } from '../components/AdminScansSection'
import { AdminSettingsSection } from '../components/AdminSettingsSection'
import { AdminSidebar } from '../components/AdminSidebar'
import { AdminSubscriptionsSection } from '../components/AdminSubscriptionsSection'
import { ProductWithConfigModal } from '../components/Productwithconfigmodal'
import { useAdminPageController } from '../hooks/useAdminPageController'

export default function AdminPage() {
  const admin = useAdminPageController()

  if (admin.shouldShowLoader) {
    return <Loader fullScreen label="Loading admin dashboard" />
  }

  if (admin.tabs.length === 0) {
    return (
      <section className="admin-shell section-shell min-h-screen bg-admin-surface pb-12 pt-4">
        <div className="rounded-lg border border-admin-border bg-white p-6 text-admin-ink shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-admin-accent">Admin access</p>
          <h1 className="mt-2 font-admin text-2xl font-semibold">No admin sections available</h1>
          <p className="mt-2 text-sm text-admin-muted">
            Your session loaded, but the current role is not allowed to view admin sections. Refresh your profile or sign in with an admin account.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-shell section-shell min-h-screen bg-admin-surface pb-12 pt-4">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar
          adminRole={admin.adminRole}
          activeSection={admin.activeSection}
          sections={admin.tabs}
          onSectionChange={admin.changeSection}
          onRefresh={admin.refreshAdmin}
          onSignOut={() => void admin.signOut()}
        />

        <div className="space-y-6">
          {admin.activeSection === 'overview' ? (
            <AdminOverviewSection
              cards={admin.overviewCards}
              activityLog={admin.systemActivityLog}
              rowCount={(admin.scansQuery.data?.length ?? 0) + (admin.productsQuery.data?.length ?? 0)}
              pingTime={admin.pingTime}
              pingStatus={admin.pingStatus}
              onPing={admin.testPing}
              onNavigate={admin.changeSection}
            />
          ) : null}

          {admin.activeSection === 'products' ? (
            <AdminProductsSection
              products={admin.paginatedProducts}
              filteredCount={admin.filteredProducts.length}
              categories={admin.categoriesQuery.data ?? []}
              search={admin.productSearch}
              categoryFilter={admin.productCategoryFilter}
              page={admin.productPage}
              totalPages={admin.totalProductPages}
              isDeleting={admin.deleteProductMutation.isPending}
              onSearchChange={admin.updateProductSearch}
              onCategoryFilterChange={admin.updateProductCategoryFilter}
              onPageChange={admin.updateProductPage}
              onAdd={() => admin.openProductModal()}
              onEdit={admin.openProductModal}
              onDelete={admin.deleteProduct}
            />
          ) : null}

          {admin.activeSection === 'categories' ? (
            <AdminCategoriesSection
              categories={admin.paginatedCategories}
              filteredCount={admin.filteredCategories.length}
              search={admin.categorySearch}
              page={admin.categoryPage}
              totalPages={admin.totalCategoryPages}
              modalOpen={admin.categoryModalOpen}
              form={admin.categoryForm}
              isDeleting={admin.deleteCategoryMutation.isPending}
              isSaving={admin.saveCategoryMutation.isPending}
              saveError={admin.saveCategoryMutation.error?.message}
              onSearchChange={admin.updateCategorySearch}
              onPageChange={admin.updateCategoryPage}
              onAdd={() => admin.openCategoryModal()}
              onEdit={admin.openCategoryModal}
              onDelete={admin.deleteCategory}
              onModalClose={admin.closeCategoryModal}
              onFormChange={admin.updateCategoryForm}
              onSave={admin.saveCategory}
            />
          ) : null}

          {admin.activeSection === 'product-configs' ? (
            <AdminProductVariantsSection
              variants={admin.productConfigsQuery.data ?? []}
              products={admin.productsQuery.data ?? []}
              isDeleting={admin.deleteProductConfigMutation.isPending}
              onEdit={admin.editVariant}
              onDelete={admin.deleteVariant}
            />
          ) : null}

          {admin.activeSection === 'scans' ? (
            <AdminScansSection
              scans={admin.paginatedAdminScans}
              filteredCount={admin.filteredAdminScans.length}
              search={admin.adminScanSearch}
              modeFilter={admin.adminScanModeFilter}
              page={admin.adminScanPage}
              totalPages={admin.totalAdminScanPages}
              isDeleting={admin.deleteScanMutation.isPending}
              userLookup={admin.userLookup}
              onSearchChange={admin.updateScanSearch}
              onModeFilterChange={admin.updateScanModeFilter}
              onPageChange={admin.updateScanPage}
              onDelete={admin.deleteScan}
            />
          ) : null}

          {admin.activeSection === 'access' ? (
            <AdminAccessSection
              users={admin.filteredUsers}
              filteredCount={admin.filteredUsers.length}
              plans={admin.plansQuery.data ?? []}
              currentUserEmail={admin.currentAuthUser?.email}
              search={admin.userSearch}
              roleFilter={admin.userRoleFilter}
              planFilter={admin.userPlanFilter}
              onSearchChange={admin.updateUserSearch}
              onRoleFilterChange={admin.updateUserRoleFilter}
              onPlanFilterChange={admin.updateUserPlanFilter}
              isDeleting={admin.deleteUserRoleMutation.isPending}
              onDelete={admin.deleteAccessUser}
              onCreateUser={admin.createAccessUser}
              isCreating={false}
              onUpdateUser={admin.updateAccessUser}
              isUpdating={admin.updateUserPlanMutation.isPending}
            />
          ) : null}

          {admin.activeSection === 'plans' ? (
            <AdminPlansSection
              plans={admin.plansQuery.data ?? []}
              isCreating={admin.createPlanMutation.isPending}
              isUpdating={admin.updatePlanMutation.isPending}
              isDeleting={admin.deletePlanMutation.isPending}
              onCreatePlan={admin.createPlan}
              onUpdatePlan={admin.updatePlan}
              onDeletePlan={admin.deletePlan}
            />
          ) : null}

          {admin.activeSection === 'api-keys' ? (
            <AdminApiKeysSection
              keys={admin.keysQuery.data ?? []}
              isToggling={admin.toggleApiKeyActiveMutation.isPending}
              isDeleting={admin.deleteApiKeyMutation.isPending}
              onSave={admin.saveApiKey}
              onToggleActive={admin.toggleApiKeyActive}
              onDelete={admin.deleteApiKey}
            />
          ) : null}

          {admin.activeSection === 'settings' ? <AdminSettingsSection /> : null}

          {admin.activeSection === 'revenue' ? (
            <AdminRevenueSection
              orders={admin.filteredOrders}
              stats={admin.revenueStats}
              search={admin.orderSearch}
              statusFilter={admin.orderStatusFilter}
              isSimulating={admin.simulateOrderMutation.isPending}
              isUpdatingStatus={admin.updateOrderStatusMutation.isPending}
              isDeleting={admin.deleteOrderMutation.isPending}
              onSearchChange={admin.updateOrderSearch}
              onStatusFilterChange={admin.updateOrderStatusFilter}
              onSimulateOrder={admin.simulateOrder}
              onUpdateStatus={admin.updateOrderStatus}
              onDelete={admin.deleteOrder}
            />
          ) : null}

          {admin.activeSection === 'subscriptions' ? (
            <AdminSubscriptionsSection adminUseCases={admin.adminUseCases} />
          ) : null}

          <ProductWithConfigModal
            configOnly={admin.configOnlyMode}
            open={admin.productModalOpen}
            onClose={admin.closeProductModal}
            categories={admin.categoriesQuery.data ?? []}
            initial={admin.editingProduct}
            existingConfigs={admin.existingConfigs}
            onSaved={admin.handleProductSaved}
          />
        </div>
      </div>
    </section>
  )
}
