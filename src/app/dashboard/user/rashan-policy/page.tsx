"use client";
import Header from "@/app/_components/header/index";
import Sidebar from "@/app/_components/sidebar/index";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";

export default function index() {
  return (
    <div className="min-h-screen flex gap-[20px] px-[20px] xl:px-[30px]">
      <div className="w-[15%] relative">
        <Sidebar />
      </div>
      <div className="w-full mx-auto space-y-8 p-4">
        <div><Header /></div>
        <div className="px-6 py-6 bg-[#f9f9f9] rounded-[20px] xl:rounded-[25px] text-[#2b3990]">
          <h1 className="text-2xl font-bold my-0">Ration Policy</h1>
          <Breadcrumb
            items={[{ label: "Dashboard" }, { label: "Ration Policy" }]}
          />
        </div>

        <div className="rounded-[20px] xl:rounded-[25px] bg-[#f9f9f9] p-6 relative border-[1px] border-[#2b3990]">
          <section className="pt-[10px]">
            <p className="inline text-md my-0 text-[#2b3990] font-semibold bg-[#f9f9f9] px-4 py-1 absolute -top-4 left-7 rounded-[10px] uppercase tracking-[5px] border-[1px] border-[#2b3990]">
              Eligibility Criteria
            </p>
            <p>
              Employees who successfully complete their probation period by the end
              of the current month will become eligible to receive ration benefits
              for the following month.
            </p>
            <p className="mt-2 italic">
              <b>Example -</b> An employee whose probation ends on or before <b>July 31st</b> will
              be eligible for <b>August’s</b> ration.
              <br />
            </p>
              <p className="pt-2 pb-2">The following categories are not eligible for ration benefits unless explicitly stated in their employment contract:</p>
             <ul className="list-disc pl-10 space-y-1">
              <li>
                Contractual staff and interns
              </li>
              <li>
                Employees serving their notice period
              </li>
              <li>
                Employees working remotely (from home)
              </li>
            </ul>
          </section>
        </div>

        <div className="rounded-[20px] xl:rounded-[25px] bg-[#f9f9f9] p-6 relative border-[1px] border-[#2b3990]">
          <section className="pt-[10px]">
            <p className="inline text-md my-0 text-[#2b3990] font-semibold bg-[#f9f9f9] px-4 py-1 absolute -top-4 left-7 rounded-[10px] uppercase tracking-[5px] border-[1px] border-[#2b3990]">
              Purchase Limit
            </p>
            <ul className="list-disc pl-10 space-y-1">
              <li>The maximum limit for ration purchases is <b>PKR 20,000</b> per month.</li>
              <li>
                Employees may exceed this limit by a maximum of <b>PKR 5,000</b>, bringing
                the absolute cap to <b>PKR 25,000</b>.
              </li>
              <li>
                Any amount exceeding the initial <b>PKR 20,000</b> limit must be borne
                entirely by the employee.
              </li>
            </ul>
          </section>
        </div>

        <div className="rounded-[20px] xl:rounded-[25px] bg-[#f9f9f9] p-6 relative border-[1px] border-[#2b3990]">
          <section className="pt-[10px]">
            <p className="inline text-md my-0 text-[#2b3990] font-semibold bg-[#f9f9f9] px-4 py-1 absolute -top-4 left-7 rounded-[10px] uppercase tracking-[5px] border-[1px] border-[#2b3990]">
              Cost Sharing Structure
            </p>
            <ul className="list-disc pl-10 space-y-1">
              <li>
                For purchases within the <b>PKR 20,000</b> limit, the cost will be shared
                equally between the employee and the employer.
              </li>
              <li>
                The employee will contribute <b>PKR 10,000</b>, while the employer will
                cover the remaining <b>PKR 10,000</b>.
              </li>
            </ul>
          </section>
        </div>

        <div className="rounded-[20px] xl:rounded-[25px] bg-[#f9f9f9] p-6 relative border-[1px] border-[#2b3990]">
          <section className="pt-[10px]">
            <p className="inline text-md my-0 text-[#2b3990] font-semibold bg-[#f9f9f9] px-4 py-1 absolute -top-4 left-7 rounded-[10px] uppercase tracking-[5px] border-[1px] border-[#2b3990]">
              Remote Location Allowance
            </p>
            <p>
              Employees who are unable to avail the ration facility due to their
              permanent residence being in a remote location <b>(e.g., Gilgit-Baltistan,
                Kashmir, etc.)</b> will be provided a <b>monthly stipend of PKR 7,000</b> in lieu
              of ration support.
            </p>
          </section>
        </div>

        <div className="rounded-[20px] xl:rounded-[25px] bg-[#f9f9f9] p-6 relative border-[1px] border-[#2b3990]">
          <section className="pt-[10px]">
            <p className="inline text-md my-0 text-[#2b3990] font-semibold bg-[#f9f9f9] px-4 py-1 absolute -top-4 left-7 rounded-[10px] uppercase tracking-[5px] border-[1px] border-[#2b3990]">
              General Conditions
            </p>
            <ul className="list-disc pl-10 space-y-1">
              <li>
                This benefit is subject to internal verification of eligibility and
                management approval.
              </li>
              <li>
                Misuse or misrepresentation of eligibility information may result in
                disqualification from this facility.
              </li>
            </ul>
            <p className="mt-4">
              For any further clarification, employees are advised to contact the <b>HR
                department.</b>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};


