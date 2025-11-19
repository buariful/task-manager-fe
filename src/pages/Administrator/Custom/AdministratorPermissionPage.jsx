import { Spinner } from "Assets/svgs";
import PermissionPageHeader from "Components/Administrator/PermissionPageHeader";
import Permissions from "Components/Administrator/Permissions";
import PermissionSideBar from "Components/Administrator/PermissionSIdeBar";
import { AuthContext } from "Context/Auth";
import { AdministratorPermissionProvider } from "Context/Custom";

export default function AdministratorPermissionPage() {
  return (
    <div className="p-7">
      <AdministratorPermissionProvider>
        <PermissionPageHeader />
        <div className={`flex  min-h-screen w-full max-w-full `}>
          <PermissionSideBar />
          <div className={` w-full overflow-hidden`}>
            <div className="w-full overflow-y-auto overflow-x-hidden">
              <Permissions />
            </div>
          </div>
        </div>
      </AdministratorPermissionProvider>
    </div>
  );
}
