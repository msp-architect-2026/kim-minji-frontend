import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchRecordById } from '../api/recordApi';

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRecordById(id);
        setRecord(data);
      } catch (e) {
        console.error('상세조회 실패', e);
      }
    };
    load();
  }, [id]);

  if (!record) return <div className="text-center text-gray-600">불러오는 중...</div>;

  return (
    <div className="max-w-lg space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline text-sm"
      >
        ← 목록으로
      </button>

      <h2 className="text-2xl font-bold text-gray-800">Analysis Details</h2>

      <div className="border rounded-xl shadow p-6 space-y-3 bg-white">
        <p><strong>ID:</strong> {record.id}</p>
        <p><strong>Filename:</strong> {record.filename}</p>
        <p><strong>Prediction:</strong> {record.prediction}</p>
        <p><strong>Confidence:</strong> {(record.confidence * 100).toFixed(2)}%</p>
        <p><strong>Created At:</strong> {record.createdAt}</p>
      </div>
    </div>
  );
}