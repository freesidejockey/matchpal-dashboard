// import { columns, Student } from "./columns";
import { columns, Student } from "./Columns";
import { DataTable } from "./DataTable";

// Sample data - replace with your actual data source
const students: Student[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    school: "MIT",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    school: "Stanford",
  },
  {
    id: "3",
    firstName: "Bob",
    lastName: "Johnson",
    school: "Harvard",
  },
  {
    id: "4",
    firstName: "Alice",
    lastName: "Williams",
    school: "MIT",
  },
  {
    id: "5",
    firstName: "Charlie",
    lastName: "Brown",
    school: "Yale",
  },
  {
    id: "6",
    firstName: "Charlie",
    lastName: "Brown",
    school: "Yale",
  },
  {
    id: "7",
    firstName: "Charlie",
    lastName: "Brown",
    school: "Yale",
  },
  {
    id: "8",
    firstName: "Charlie",
    lastName: "Brown",
    school: "Yale",
  },
  {
    id: "9",
    firstName: "Charlie",
    lastName: "Brown",
    school: "Yale",
  },
  {
    id: "10",
    firstName: "Charlie",
    lastName: "Brown",
    school: "Yale",
  },
  // Add more students...
];

export default function StudentTablePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">Students</h1>
      <DataTable columns={columns} data={students} />
    </div>
  );
}
