const x = <div>Hello</div>;

// This will throw an error
function Hello(props: { name: string }) {
  return (
    <div>
      <div>Hello</div>
      <div>Hello</div>
    </div>
  );
}

console.log(<Hello name='hello' />);
